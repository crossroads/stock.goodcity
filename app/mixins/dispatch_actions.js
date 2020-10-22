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
  i18n: Ember.inject.service(),

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
    const pkgLocation = pkg
      .get("packagesLocations")
      .find(k => +k.get("locationId") === +loc.id);
    const maxQuantity = pkgLocation.get("quantity");

    this.set("dispatchableQuantity", maxQuantity);
    this.set("dispatchQty", ordPkg.get("undispatchedQty"));

    if (this.get("dispatchQty") > maxQuantity) {
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
      return this.get("locationService").userPickLocation({
        headerText: this.get("i18n").t("select_location.dispatch_from"),
        presetLocations
      });
    }

    return presetLocations.get("firstObject");
  },

  dispatchQuantityInvalid: Ember.computed(
    "dispatchQty",
    "dispatchableQuantity",
    function() {
      const qty = this.get("dispatchQty");
      const max = this.get("dispatchableQuantity");
      return isNaN(qty) || isNaN(max) || qty > max || qty < 1;
    }
  ),

  onQuantitiesChange: Ember.observer(
    "dispatchLocation",
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
      if (!this.get("readyToDispatch") || this.get("dispatchQuantityInvalid"))
        return;

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
