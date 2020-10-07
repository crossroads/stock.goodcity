import Ember from "ember";
import _ from "lodash";
const { getOwner } = Ember;

export default Ember.Component.extend({
  packageService: Ember.inject.service(),
  store: Ember.inject.service(),
  messageBox: Ember.inject.service(),
  i18n: Ember.inject.service(),
  locationQuantities: [],

  pkgLocations: Ember.computed.alias("pkg.packagesLocations"),

  onOpen: Ember.observer("open", function() {
    if (!this.get("open")) {
      return this.set("locationQuantities", []);
    }

    this.set(
      "locationQuantities",
      this.get("pkgLocations").map(pl => ({
        name: pl.get("location.name"),
        packageLocation: pl,
        selectedQuantity: pl.get("quantity")
      }))
    );
  }),

  totalNumberTomove: Ember.computed(
    "locationQuantities.@each.selectedQuantity",
    function() {
      return this.get("locationQuantities").reduce((acc, lq) => {
        return acc + Number(lq.selectedQuantity);
      }, 0);
    }
  ),

  resolveAddItemPromises() {
    const loadingView = getOwner(this)
      .lookup("component:loading")
      .append();
    let promises = this.addItemPromises();
    Ember.RSVP.all(promises)
      .then(() => {
        this.sendAction("onConfirm");
        this.set("open", false);
      })
      .finally(() => loadingView.destroy());
  },

  hasInvalidAddedQuantity() {
    return !!this.get("locationQuantities").find(lq => {
      return (
        lq.selectedQuantity < 0 ||
        lq.selectedQuantity > lq.packageLocation.get("quantity")
      );
    });
  },

  addItemPromises() {
    let promises = [];
    this.get("locationQuantities").map(lq => {
      let { selectedQuantity, packageLocation } = lq;
      if (selectedQuantity > 0) {
        const params = {
          item_id: this.get("pkg").id,
          task: "pack",
          location_id: packageLocation.get("locationId"),
          quantity: selectedQuantity
        };
        promises.push(
          this.get("packageService").addRemoveItem(
            this.get("entity.id"),
            params
          )
        );
      }
    });
    return promises;
  },

  actions: {
    moveItemToBox() {
      let pkg = this.get("pkg");
      if (pkg) {
        if (this.hasInvalidAddedQuantity()) {
          this.get("messageBox").alert(
            this.get("i18n").t("box_pallet.invalid_quantity")
          );
        } else {
          this.resolveAddItemPromises();
        }
      }
    },

    cancelMove() {
      this.set("open", false);
    }
  }
});
