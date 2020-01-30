import { observer } from "@ember/object";
import { alias } from "@ember/object/computed";
import { inject as service } from "@ember/service";
import Mixin from "@ember/object/mixin";
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
export default Mixin.create(AsyncMixin, {
  designationService: service(),
  settings: service(),

  editableQty: alias("settings.allowPartialOperations"),

  clearDesignationParams() {
    this.set("readyToDesignate", false);
    this.set("designatableQuantity", 0);
    this.set("designationTargetPackage", null);
    this.set("designationTargetOrder", null);
    this.set("designationQty", 0);
  },

  computeDesignationQuantities() {
    const pkg = this.get("designationTargetPackage");
    const order = this.get("designationTargetOrder");

    if (!order || !pkg) {
      this.set("designatableQuantity", 0);
      this.set("designationQty", 0);
      return;
    }

    const maxQuantity =
      pkg.get("availableQty") + this.alreadyDesignatedQuantity(pkg, order);

    this.set("designatableQuantity", maxQuantity);
    if (!this.get("designationQty")) {
      this.set("designationQty", maxQuantity);
    }
  },

  alreadyDesignatedQuantity(pkg, order) {
    const ordPkg = pkg.get("ordersPackages").find(op => {
      return parseInt(op.get("orderId")) === parseInt(order.get("id"));
    });
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

  onDesignationsChange: observer(
    "designationTargetPackage.ordersPackages.[]",
    "designationTargetPackage.ordersPackages.@each.{state,quantity}",
    function() {
      this.computeDesignationQuantities();
    }
  ),

  actions: {
    beginDesignation(pkg, order) {
      this.resolveOrder(order).then(target => {
        if (target) {
          this.set("designationTargetPackage", pkg);
          this.set("designationTargetOrder", target);
          this.computeDesignationQuantities();
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
