import Ember from "ember";
import _ from "lodash";

/**
 * Helper properties for the designation form
 *
 */
export default Ember.Component.extend({
  // Check quantities for anomalies
  canComplete: Ember.computed("quantity", "maxQuantity", function() {
    return (
      this.get("maxQuantity") > 0 &&
      this.get("quantity") > 0 &&
      this.get("quantity") <= this.get("maxQuantity")
    );
  }),

  // Lists other orders the package is designated to
  otherDesignations: Ember.computed(
    "order.id",
    "pkg",
    "pkg.ordersPackages.[]",
    "pkg.ordersPackages.@each.{state,quantity}",
    function() {
      if (!this.get("pkg")) {
        return false;
      }

      return this.get("pkg.ordersPackages")
        .filterBy("state", "designated")
        .rejectBy("id", this.get("order.id"));
    }
  ),

  // Whether the package is designated to some other order
  packageHasOtherDesignations: Ember.computed(
    "otherDesignations.length",
    function() {
      return this.get("otherDesignations.length") > 0;
    }
  ),

  // Will suggest user to undesignate if the available quantity is 0 and some
  // other order exists
  suggestUndesignation: Ember.computed(
    "maxQuantity",
    "packageHasOtherDesignations",
    function() {
      if (this.get("maxQuantity") > 0) {
        return false;
      }

      return this.get("packageHasOtherDesignations");
    }
  )
});
