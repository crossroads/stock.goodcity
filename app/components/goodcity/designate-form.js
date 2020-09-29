import Ember from "ember";
import _ from "lodash";
import { ACTIVE_ORDER_STATES } from "stock/constants/states";
import AsyncMixin, { ERROR_STRATEGIES } from "stock/mixins/async";
import DesignationActions from "stock/mixins/designation_actions";

/**
 * Helper properties for the designation form
 *
 */
export default Ember.Component.extend(DesignationActions, AsyncMixin, {
  readyToDesignate: false,
  designationQty: 0,
  designatableQuantity: 0,
  designationTargetOrder: null,
  designationTargetPackage: null,

  // designationQty = designationQty
  // designatableQuantity = designatableQuantity
  // editableQty = editableQty
  // designationTargetPackage = designationTargetPackage
  // readyToDesignate = readyToDesignate

  designationService: Ember.inject.service(),

  // Check quantities for anomalies
  canComplete: Ember.computed("quantity", "designatableQuantity", function() {
    return (
      this.get("designatableQuantity") > 0 &&
      this.get("quantity") > 0 &&
      this.get("quantity") <= this.get("designatableQuantity")
    );
  }),

  // Search order to designate
  async resolveOrder() {
    return this.get("designationService").userPickOrder({
      state: ACTIVE_ORDER_STATES.join(",")
    });
  },

  // Lists other orders the package is designated to
  // otherDesignations: Ember.computed(
  //   "order.id",
  //   "designationTargetPackage",
  //   "designationTargetPackage.ordersPackages.[]",
  //   "designationTargetPackage.ordersPackages.@each.{state,quantity}",
  //   function() {
  //     if (!this.get("designationTargetPackage")) {
  //       return false;
  //     }

  //     return this.get("designationTargetPackage.ordersPackages")
  //       .filterBy("state", "designated")
  //       .rejectBy("id", this.get("order.id"));
  //   }
  // ),

  // Whether the package is designated to some other order
  // packageHasOtherDesignations: Ember.computed(
  //   "otherDesignations.length",
  //   function() {
  //     return this.get("otherDesignations.length") > 0;
  //   }
  // ),

  // Will suggest user to undesignate if the available quantity is 0 and some
  // other order exists
  // suggestUndesignation: Ember.computed(
  //   "designatableQuantity",
  //   "packageHasOtherDesignations",
  //   function() {
  //     if (this.get("designatableQuantity") > 0) {
  //       return false;
  //     }
  //     return this.get("packageHasOtherDesignations");
  //   }
  // ),

  isValidForm: Ember.computed(
    "designationQty",
    "designationTargetOrder",
    function() {
      let value = +this.get("designationQty");
      return (
        value > 0 &&
        value <= this.get("designatableQuantity") &&
        this.get("designationTargetOrder")
      );
    }
  ),

  didInsertElement() {
    this._super();
    this.computeDesignationQuantities();
  },

  actions: {
    cancelAction() {
      this.clearDesignationParams();
      this.set("readyToDesignate", false);
    },

    selectOrderAction() {
      this.resolveOrder().then(target => {
        if (target) {
          this.set("designationTargetOrder", target);
        }
      });
    },

    confirmAction() {
      if (!this.get("readyToDesignate")) return;

      this.runTask(() => {
        const designationTargetPackage = this.get("designationTargetPackage");
        const order = this.get("designationTargetOrder");
        const quantity = this.get("designationQty");

        return this.get("designationService").designate(
          designationTargetPackage,
          {
            order,
            quantity
          }
        );
      }, ERROR_STRATEGIES.MODAL).finally(() => {
        this.clearDesignationParams();
      });
    }
  }
});
