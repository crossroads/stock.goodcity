import { computed } from "@ember/object";
import { bool, equal, alias } from "@ember/object/computed";
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
  allowedActions: attr(),

  item: belongsTo("item", { async: false }),
  designation: belongsTo("designation", { async: true }),
  isDispatched: bool("sentOn"),

  isRequested: equal("state", "requested"),
  isDesignated: equal("state", "designated"),
  isCancelled: equal("state", "cancelled"),

  availableQty: alias("quantity"),
  isSingleQuantity: equal("quantity", 1),

  qtyToModify: computed("quantity", "item.quantity", function() {
    return this.get("quantity") + this.get("item.quantity");
  }),

  orderCode: computed("designation", function() {
    return this.get("designation.code");
  })
});
