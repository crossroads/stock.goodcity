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
  sentOn: attr("date"),
  state: attr("string"),

  item: belongsTo("item", { async: true }),
  designation: belongsTo("designation", { async: true }),
  isDispatched: Ember.computed.bool("sentOn"),

  isRequested: Ember.computed.equal("state", "requested"),
  isDesignated: Ember.computed.equal("state", "designated"),
  isCancelled: Ember.computed.equal("state", "cancelled"),

  availableQty: Ember.computed.alias("quantity"),
  isSingleQuantity: Ember.computed.equal("quantity", 1),

  qtyToModify: Ember.computed("quantity", "item.quantity", function() {
    return this.get("quantity") + this.get("item.quantity");
  }),

  orderCode: Ember.computed("designation", function() {
    return this.get("designation.code");
  })
});
