import Ember from "ember";
import AsyncMixin, { ERROR_STRATEGIES } from "stock/mixins/async";
import _ from "lodash";

export default Ember.Component.extend(AsyncMixin, {
  packageService: Ember.inject.service(),
  store: Ember.inject.service(),
  messageBox: Ember.inject.service(),
  i18n: Ember.inject.service(),

  pkgLocations: Ember.computed("pkg.packagesLocations", function() {
    return this.getAttributesFor("packagesLocations");
  }),

  pkgLocationName: Ember.computed("pkg.packagesLocations", function() {
    return this.getAttributesFor("packagesLocationsName");
  }),

  getAttributesFor(parameter) {
    let pkg = this.get("pkg");
    if (pkg) {
      if (parameter == "packagesLocationsName") {
        return this.get("pkgLocations").get("firstObject.location.name");
      }
      return this.get("pkg").get("packagesLocations");
    }
  },

  calculateSumFor(parameter) {
    let quantities = [];
    if (this.get("pkg.packagesLocations")) {
      quantities = this.get("pkg.packagesLocations").map(value =>
        value.get(parameter)
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

  addRemoveItem(params) {
    this.runTask(async () => {
      const data = await this.get("packageService").addRemoveItem(
        this.get("entity.id"),
        params
      );
      this.get("store").pushPayload(data);
      this.set("open", false);
      this.sendAction("onConfirm");
    }, ERROR_STRATEGIES.MODAL);
  },

  actions: {
    moveItemToBox() {
      let pkg = this.get("pkg");
      if (pkg) {
        this.get("pkgLocations").forEach(pkgLocation => {
          let selectedQuantity = pkgLocation.get("defaultQuantity");
          if (pkgLocation.get("hasDirtyAttributes") && selectedQuantity) {
            const params = {
              item_id: pkg.id,
              task: "pack",
              location_id: pkgLocation.get("locationId"),
              quantity: selectedQuantity
            };
            this.addRemoveItem(params);
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
