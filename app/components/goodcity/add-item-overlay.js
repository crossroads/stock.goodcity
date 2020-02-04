import Ember from "ember";
import _ from "lodash";

export default Ember.Component.extend({
  packageService: Ember.inject.service(),

  pkgLocations: Ember.computed("pkg", function() {
    let pkg = this.get("pkg");
    if (pkg) {
      return this.get("pkg").get("packagesLocations");
    }
  }),

  pkgLocationName: Ember.computed("pkg", function() {
    let pkgLocations = this.get("pkgLocations");
    if (pkgLocations) {
      return this.get("pkgLocations").get("firstObject.location.name");
    }
  }),

  totalNumberTomove: Ember.computed(
    "pkg.packagesLocations.@each.defaultQuantity",
    function() {
      let sum = 0;
      if (this.get("pkg.packagesLocations")) {
        this.get("pkg.packagesLocations").map(value => {
          sum = parseInt(sum) + parseInt(value.get("defaultQuantity"));
        });
      }
      return sum;
    }
  ),

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
            this.get("packageService").addRemoveItem(
              this.get("entity.id"),
              params
            );
          }
        });
      }
      this.sendAction("onConfirm");
      this.set("open", false);
    },

    cancelMove() {
      this.set("open", false);
    }
  }
});
