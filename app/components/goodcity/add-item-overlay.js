import Ember from "ember";
import _ from "lodash";
const { getOwner } = Ember;

export default Ember.Component.extend({
  packageService: Ember.inject.service(),
  store: Ember.inject.service(),
  messageBox: Ember.inject.service(),
  i18n: Ember.inject.service(),

  pkgLocations: Ember.computed.alias("pkg.packagesLocations"),

  pkgLocationName: Ember.computed("pkg.packagesLocations", function() {
    let pkgLocations = this.get("pkgLocations");
    return pkgLocations && pkgLocations.get("firstObject.location.name");
  }),

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
      .catch(response => {
        let error_message =
          response.responseJSON && response.responseJSON.errors[0];
        this.get("messageBox").alert(
          error_message || this.get("i18n").t("unexpected_error")
        );
      })
      .finally(() => loadingView.destroy());
  },

  hasInvalidAddedQuantity() {
    let pkgLocations = this.get("pkg.packagesLocations");
    if (pkgLocations) {
      return pkgLocations.filterBy("hasValidDefaultAddableQuantity", true)
        .length;
    }
  },

  addItemPromises() {
    let promises = [];
    this.get("pkgLocations").map(pkgLocation => {
      let selectedQuantity = pkgLocation.get("defaultAddableQuantity");
      if (pkgLocation.get("hasDirtyAttributes") && selectedQuantity) {
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

  actions: {
    moveItemToBox() {
      let pkg = this.get("pkg");
      if (pkg) {
        if (this.hasInvalidAddedQuantity()) {
          this.resolveAddItemPromises();
        } else {
          this.get("messageBox").alert(
            this.get("i18n").t("box_pallet.invalid_quantity")
          );
        }
        this.get("pkgLocations").map(pkgLocation => {
          pkgLocation.rollbackAttributes();
        });
      }
    },

    cancelMove() {
      this.set("open", false);
    }
  }
});
