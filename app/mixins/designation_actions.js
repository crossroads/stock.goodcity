import Ember from "ember";
import AsyncMixin, { ERROR_STRATEGIES } from "./async";
import { ACTIVE_ORDER_STATES } from "../constants/states";
import _ from "lodash";

/**
 * Adds the following properties:
 *
 * - readyToDesignate
 * - designationTargetPackage
 * - designationTargetOrder
 * - designationQty
 * - editableQty
 *
 * Adds the following actions:
 *
 * - beginDesignation(package)
 * - completeDesignation()
 * - cancelDesignation()
 */
export default Ember.Mixin.create(AsyncMixin, {
  designationService: Ember.inject.service(),
  settings: Ember.inject.service(),

  editableQty: Ember.computed.alias("settings.allowPartialOperations"),

  clearDesignationParams() {
    this.set("readyToDesignate", false);
    this.set("movdesignationQtyeQty", 0);
    this.set("designationTargetPackage", null);
    this.set("designationTargetOrder", null);
  },

  alreadyDesignatedQuantity(pkg, order) {
    const ordPkg = pkg.get("ordersPackages").findBy("orderId", order.get("id"));
    return ordPkg ? ordPkg.get("quantity") : 0;
  },

  async resolveOrder(order) {
    if (order) {
      return order;
    }
    return this.get("designationService").userPickOrder({
      state: ACTIVE_ORDER_STATES.join(",")
    });
  },

  actions: {
    beginDesignation(pkg, order) {
      this.resolveOrder(order).then(target => {
        if (target) {
          const maxQuantity =
            pkg.get("availableQty") +
            this.alreadyDesignatedQuantity(pkg, target);

          this.set("designatableQuantity", maxQuantity);
          this.set("designationTargetPackage", pkg);
          this.set("designationTargetOrder", target);
          this.set("designationQty", maxQuantity);
          this.set("readyToDesignate", true);
        }
      });
    },

    completeDesignation() {
      if (!this.get("readyToDesignate")) return;

      this.runTask(() => {
        const pkg = this.get("designationTargetPackage");
        const order = this.get("designationTargetOrder");
        const quantity = this.get("designationQty");

        return this.get("designationService").designate(pkg, {
          order,
          quantity
        });
      }, ERROR_STRATEGIES.MODAL).finally(() => {
        this.clearDesignationParams();
      });
    },

    async cancelDesignation() {
      this.clearDesignationParams();
    }
  }
});
