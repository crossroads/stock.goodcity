import Ember from "ember";
import _ from "lodash";

export default Ember.Component.extend({
  canComplete: Ember.computed("quantity", "maxQuantity", function() {
    return (
      this.get("maxQuantity") > 0 &&
      this.get("quantity") > 0 &&
      this.get("quantity") <= this.get("maxQuantity")
    );
  }),

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

  packageHasOtherDesignations: Ember.computed(
    "otherDesignations.length",
    function() {
      return this.get("otherDesignations.length") > 0;
    }
  ),

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
