import Ember from "ember";
import _ from "lodash";

export default Ember.Component.extend({
  packageService: Ember.inject.service(),
  numberToMove: null,

  actions: {
    moveItemToBox() {
      let pkg = this.get("pkg");
      if (pkg) {
        const params = {
          item_id: pkg.id,
          task: "pack",
          location_id: pkg.get("locations")[0].id
        };
        this.get("packageService").addRemoveItem(this.get("entity.id"), params);
      }
      this.sendAction("onConfirm");
      this.set("open", false);
    },

    cancelMove() {
      this.set("open", false);
    }
  }
});
