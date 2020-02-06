import Ember from "ember";
import _ from "lodash";

export default Ember.Component.extend({
  packageService: Ember.inject.service(),
  store: Ember.inject.service(),
  messageBox: Ember.inject.service(),
  i18n: Ember.inject.service(),

  pkgLocations: Ember.computed("pkg.packagesLocations", function() {
    let pkg = this.get("pkg");
    if (pkg) {
      return this.get("pkg").get("packagesLocations");
    }
  }),

  pkgLocationName: Ember.computed("pkg.pkgLocations", function() {
    let pkgLocations = this.get("pkgLocations");
    if (pkgLocations) {
      return this.get("pkgLocations").get("firstObject.location.name");
    }
  }),

  calculateSumFor(parameter) {
    let quantities = [];
    if (this.get("pkg.packagesLocations")) {
      this.get("pkg.packagesLocations").map(value => {
        quantities.push(value.get(parameter));
      });
    }
    return quantities.reduce((accumulator, value) => {
      return accumulator + (!(value == "") && parseInt(value));
    }, 0);
  },

  totalNumberTomove: Ember.computed(
    "pkg.packagesLocations.@each.defaultQuantity",
    function() {
      return this.calculateSumFor("defaultQuantity");
    }
  ),

  addRemoveItem(params) {
    return this.get("packageService")
      .addRemoveItem(this.get("entity.id"), params)
      .then(data => {
        this.get("store").pushPayload(data);
        this.sendAction("onConfirm");
      })
      .catch(response => {
        let error_message =
          (response.responseJSON && response.responseJSON.errors[0]) ||
          this.get("i18n").t("unexpected_error");
        this.get("messageBox").alert(error_message);
      });
  },

  actions: {
    moveItemToBox() {
      let pkg = this.get("pkg");
      if (pkg) {
        this.get("pkgLocations").forEach(pkgLocation => {
          let selectedQuantity = pkgLocation.get("defaultQuantity");
          if (pkgLocation.get("hasDirtyAttributes") && selectedQuantity != 0) {
            const params = {
              item_id: pkg.id,
              task: "pack",
              location_id: pkgLocation.get("locationId"),
              quantity: selectedQuantity
            };
            this.addRemoveItem(params);
            this.set("open", false);
          }
          pkgLocation.rollbackAttributes();
        });
      }
    },

    cancelMove() {
      this.set("open", false);
    }
  }
});
