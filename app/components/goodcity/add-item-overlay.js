import Ember from "ember";
const { getOwner } = Ember;
import SingletonComponent from "../base/global";
import _ from "lodash";

export default SingletonComponent.extend({
  packageService: Ember.inject.service(),
  store: Ember.inject.service(),
  messageBox: Ember.inject.service(),
  i18n: Ember.inject.service(),

  init() {
    this._super("add-item-overlay");
  },

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
    var loadingView = getOwner(this)
      .lookup("component:loading")
      .append();
    return this.get("packageService")
      .addRemoveItem(this.get("entity.id"), params)
      .then(data => {
        this.get("store").pushPayload(data);
        this.set("open", false);
        this.sendAction("onConfirm");
      })
      .catch(response => {
        this.get("messageBox").alert(
          (response.responseJSON && response.responseJSON.errors[0]) ||
            this.get("i18n").t("unexpected_error")
        );
      })
      .finally(() => {
        loadingView.destroy();
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
