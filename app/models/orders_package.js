import Ember from "ember";
import Model from "ember-data/model";
import attr from "ember-data/attr";
import { belongsTo } from "ember-data/relationships";

export default Model.extend({
  packageId: attr("number"),
  orderId: attr("number"),
  itemId: attr("number"),
  designationId: attr("number"),
  quantity: attr("number"),
  dispatchedQuantity: attr("number"),
  shippingNumber: attr("number"),
  sentOn: attr("date"),
  state: attr("string"),
  allowedActions: attr(),
  updatedById: attr("number"),
  createdAt: attr("date"),

  updatedBy: belongsTo("user", { async: false }),
  item: belongsTo("item", { async: false }),
  designation: belongsTo("designation", { async: true }),
  isDispatched: Ember.computed.bool("sentOn"),

  isRequested: Ember.computed.equal("state", "requested"),
  isDesignated: Ember.computed.equal("state", "designated"),
  isCancelled: Ember.computed.equal("state", "cancelled"),

  isSingleQuantity: Ember.computed.equal("quantity", 1),

  absoluteQuantity: Ember.computed.alias("quantity"),

  undispatchedQty: Ember.computed("quantity", "dispatchedQuantity", function() {
    return this.get("quantity") - this.get("dispatchedQuantity");
  }),

  orderCode: Ember.computed("designation", function() {
    return this.get("designation.code");
  }),

  locationSubscript: Ember.computed("quantity", function() {
    return Number(this.get("quantity")) >= 0 ? "To" : "From";
  }),

  arrow: Ember.computed("quantity", function() {
    return Number(this.get("quantity")) >= 0 ? "arrow-up" : "arrow-down";
  }),

  partiallyDispatched: Ember.computed(
    "undispatchedQty",
    "dispatchedQuantity",
    function() {
      return (
        this.get("undispatchedQty") > 0 && this.get("dispatchedQuantity") > 0
      );
    }
  )
});
