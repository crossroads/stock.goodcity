import Ember from "ember";
import _ from "lodash";

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
    "pkg.packagesLocations.@each.defaultQuantity",
    function() {
      return this.calculateSumFor("defaultQuantity");
    }
  ),

  resolvePromise() {
    let promises = this.createPromises();
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
      });
  },

  isAddedQuantityInvalid() {
    let pkgLocations = this.get("pkg.packagesLocations");
    if (pkgLocations) {
      return pkgLocations.getEach("isDefaultQuantityValid").includes(false);
    }
  },

  createPromises() {
    let promises = [];
    this.get("pkgLocations").map(pkgLocation => {
      let selectedQuantity = pkgLocation.get("defaultQuantity");
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
        if (this.isAddedQuantityInvalid()) {
          this.get("messageBox").alert(
            this.get("i18n").t("box_pallet.invalid_quantity")
          );
        } else {
          this.resolvePromise();
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
