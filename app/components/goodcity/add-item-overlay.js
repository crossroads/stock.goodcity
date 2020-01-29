import Ember from "ember";
import _ from "lodash";

export default Ember.Component.extend({
  packageService: Ember.inject.service(),

  actions: {
    moveItemToBox() {
      let pkg = this.get("pkg");
      if (pkg) {
        pkg.get("packagesLocations").forEach(pkgLocation => {
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
