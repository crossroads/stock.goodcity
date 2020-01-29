import Ember from "ember";
import AsyncMixin, { ERROR_STRATEGIES } from "./async";
import _ from "lodash";

/**
 * @mixin DispatchAction
 * @augments ember/Mixin
 * @description
 * <br> Adds the following properties:
 * <br>
 * <br> - readyToDispatch
 * <br> - dispatchOrdersPackage
 * <br> - dispatchLocation
 * <br> - dispatchQty
 * <br> - editableQty
 * <br>
 * <br> Adds the following actions:
 * <br>
 * <br> - beginDispatch(ordersPackage, location = null)
 * <br> - completeDispatch()
 * <br> - cancelDispatch()
 */
export default Ember.Mixin.create(AsyncMixin, {
  designationService: Ember.inject.service(),
  locationService: Ember.inject.service(),
  settings: Ember.inject.service(),

  editableQty: Ember.computed.not("settings.allowPartialOperations"),

  clearDispatchParams() {
    this.set("readyToDispatch", false);
    this.set("dispatchableQuantity", 0);
    this.set("dispatchOrdersPackage", null);
    this.set("dispatchLocation", null);
    this.set("dispatchQty", 0);
  },

  computeDispatchQuantities() {
    const ordPkg = this.get("dispatchOrdersPackage");
    const loc = this.get("dispatchLocation");

    if (!loc || !ordPkg) {
      this.set("dispatchableQuantity", 0);
      this.set("dispatchQty", 0);
      return;
    }

    const pkg = ordPkg.get("item");
    const pkgLocation = pkg.get("packagesLocations").findBy("location", loc);
    const availableQty = pkgLocation ? pkgLocation.get("quantity") : 0;

    const maxQuantity = Math.min(availableQty, ordPkg.get("undispatchedQty"));

    this.set("dispatchableQuantity", maxQuantity);
    if (!this.get("dispatchQty") || this.get("dispatchQty") > maxQuantity) {
      this.set("dispatchQty", maxQuantity);
    }
  },

  async resolveLocation(ordersPackage, location) {
    if (location) {
      return location;
    }

    const pkg = ordersPackage.get("item");
    const presetLocations = pkg.get("packagesLocations").mapBy("location");

    if (presetLocations.get("length") > 1) {
      return this.get("locationService").userPickLocation({ presetLocations });
    }

    return presetLocations.get("firstObject");
  },

  onQuantitiesChange: Ember.observer(
    "dispatchOrdersPackage.undispatchedQty",
    "dispatchOrdersPackage.package.packagesLocations.@each.{quantity}",
    function() {
      this.computeDispatchQuantities();
    }
  ),

  actions: {
    async pickDispatchLocation() {
      this.send("beginDispatch", this.get("dispatchOrdersPackage"), null);
    },

    beginDispatch(ordersPackage, location = null) {
      this.resolveLocation(ordersPackage, location).then(loc => {
        if (loc) {
          Ember.run(() => {
            this.set("dispatchOrdersPackage", ordersPackage);
            this.set("dispatchLocation", loc);
            this.computeDispatchQuantities();
            this.set("readyToDispatch", true);
          });
        }
      });
    },

    completeDispatch() {
      if (!this.get("readyToDispatch")) return;

      this.runTask(() => {
        const ordPkg = this.get("dispatchOrdersPackage");
        const location = this.get("dispatchLocation");
        const quantity = this.get("dispatchQty");

        return this.get("designationService").dispatch(ordPkg, {
          from_location: location,
          quantity: quantity
        });
      }, ERROR_STRATEGIES.MODAL).finally(() => {
        this.clearDispatchParams();
      });
    },

    async cancelDispatch() {
      this.clearDispatchParams();
    }
  }
});
