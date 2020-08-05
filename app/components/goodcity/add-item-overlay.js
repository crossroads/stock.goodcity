import Ember from "ember";
import _ from "lodash";
const { getOwner } = Ember;

export default Ember.Component.extend({
  packageService: Ember.inject.service(),
  store: Ember.inject.service(),
  messageBox: Ember.inject.service(),
  i18n: Ember.inject.service(),

  pkgLocations: Ember.computed.alias("pkg.packagesLocations"),

  calculateSumFor(attribute) {
    let quantities = [];
    if (this.get("pkg.packagesLocations")) {
      quantities = this.get("pkg.packagesLocations").map(value =>
        value.get(attribute)
      );
    }
    return quantities.reduce(
      (accumulator, value) => accumulator + parseInt(value || 0),
      0
    );
  },

  totalNumberTomove: Ember.computed(
    "pkg.packagesLocations.@each.defaultAddableQuantity",
    function() {
      return this.calculateSumFor("defaultAddableQuantity");
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
    let pkgLocations = this.get("pkg.packagesLocations");
    if (pkgLocations) {
      return pkgLocations.filterBy("hasValidDefaultAddableQuantity", false)
        .length;
    }
  },

  addItemPromises() {
    let promises = [];
    this.get("pkgLocations").map(pkgLocation => {
      let selectedQuantity = pkgLocation.get("defaultAddableQuantity");
      if (selectedQuantity) {
        const params = {
          item_id: this.get("pkg").id,
          task: "pack",
          location_id: pkgLocation.get("locationId"),
          quantity: selectedQuantity
        };
        promises.push(
          this.get("packageService").addRemoveItem(
            this.get("entity.id"),
            params
          )
        );
      }
      pkgLocation.rollbackAttributes();
    });
    return promises;
  },

  resetPackageDefaultAddableQuantity() {
    this.get("pkg.packagesLocations").map(pkgloc => {
      pkgloc.set("defaultAddableQuantity", pkgloc.get("quantity"));
    });
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
        this.get("pkgLocations").map(pkgLocation => {
          pkgLocation.rollbackAttributes();
        });
        this.resetPackageDefaultAddableQuantity();
      }
    },

    cancelMove() {
      this.set("open", false);
      this.resetPackageDefaultAddableQuantity();
    }
  }
});
