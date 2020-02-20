import Ember from "ember";
import AsyncMixin, { ERROR_STRATEGIES } from "stock/mixins/async";
import _ from "lodash";

export default Ember.Component.extend(AsyncMixin, {
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

  resolvePromise(promises) {
    Promise.all(promises)
      .then(() => {
        this.sendAction("onConfirm");
        this.set("open", false);
      })
      .catch(response => {
        this.get("messageService").alert(
          response.responseText.errors[0] ||
            this.get("i18n").t("unexpected_error")
        );
      });
  },

  actions: {
    moveItemToBox() {
      let pkg = this.get("pkg");
      let promises = [];
      if (pkg) {
        this.get("pkgLocations").map(pkgLocation => {
          let selectedQuantity = pkgLocation.get("defaultQuantity");
          if (pkgLocation.get("hasDirtyAttributes") && selectedQuantity) {
            const params = {
              item_id: pkg.id,
              task: "pack",
              location_id: pkgLocation.get("locationId"),
              quantity: selectedQuantity
            };
            promises <<
              this.get("packageService").addRemoveItem(
                this.get("entity.id"),
                params
              );
          }
          pkgLocation.rollbackAttributes();
        });
        this.resolvePromise(promises);
      }
    },

    cancelMove() {
      this.set("open", false);
    }
  }
});
