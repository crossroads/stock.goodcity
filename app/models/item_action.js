import DS from "ember-data";
import { belongsTo } from "ember-data/relationships";

var attr = DS.attr;

export default DS.Model.extend({
  action: attr("string"),
  source_type: attr("string"),
  description: attr("string"),

  userId: attr("number"),
  packageId: attr("number"),
  itemId: attr("number"),
  sourceId: attr("number"),
  quantity: attr("number"),
  locationId: attr("number"),
  createdAt: attr("date"),

  item: belongsTo("item", {
    async: false
  }),

  location: belongsTo("location", {
    async: false
  }),

  user: belongsTo("user", {
    async: false
  }),

  absoluteQuantity: Ember.computed("quantity", function() {
    return Math.abs(this.get("quantity"));
  }),

  locationSubscript: Ember.computed("quantity", function() {
    return Number(this.get("quantity")) >= 0 ? "To" : "From";
  }),

  sourceSubscript: Ember.computed("quantity", function() {
    return Number(this.get("quantity")) >= 0 ? "From" : "To";
  }),

  arrow: Ember.computed("quantity", function() {
    return Number(this.get("quantity")) >= 0 ? "arrow-up" : "arrow-down";
  }),

  sourceDisplayName: Ember.computed("sourceId", "source_type", function() {
    switch (this.get("source_type")) {
      case "OrdersPackage":
        return this.get("store")
          .peekRecord("orders_package", this.get("sourceId"))
          .getWithDefault("orderCode", "N/A");
      default:
        return "";
    }
  })
});
