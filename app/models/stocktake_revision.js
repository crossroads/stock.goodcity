import Model from "ember-data/model";
import attr from "ember-data/attr";
import _ from "lodash";
import { belongsTo, hasMany } from "ember-data/relationships";

export default Model.extend({
  dirty: attr("boolean"),
  state: attr("string"),
  itemId: attr("number"),
  item: belongsTo("item", { async: true }),
  stocktake: belongsTo("stocktake", { async: false }),
  createdAt: attr("date"),
  quantity: attr("number"),
  processedDelta: attr("number"),
  warning: attr("string"),
  countedByIds: attr(),

  expectedQuantity: Ember.computed(
    "stocktake.location",
    "item.packagesLocations.[]",
    "item.packagesLocations.@each.quantity",
    function() {
      const pkgLoc = this.get("item.packagesLocations").findBy(
        "location",
        this.get("stocktake.location")
      );

      return pkgLoc ? pkgLoc.get("quantity") : 0;
    }
  ),

  isProcessed: Ember.computed.equal("state", "processed"),
  isCancelled: Ember.computed.equal("state", "cancelled"),

  computedDelta: Ember.computed("quantity", "expectedQuantity", function() {
    return this.get("quantity") - this.get("expectedQuantity");
  }),

  diff: Ember.computed("state", "processedDelta", "computedDelta", function() {
    switch (this.get("state")) {
      case "cancelled":
        return 0;
      case "processed":
        return this.get("processedDelta");
      default:
        return this.get("computedDelta");
    }
  }),

  diffAbs: Ember.computed("diff", function() {
    return Math.abs(this.get("diff"));
  }),

  isGain: Ember.computed("diff", function() {
    return this.get("diff") > 0;
  }),

  isLoss: Ember.computed("diff", function() {
    return this.get("diff") < 0;
  }),

  hasVariance: Ember.computed("diff", function() {
    return this.get("diff") !== 0;
  }),

  isValid: Ember.computed("quantity", function() {
    const qty = this.get("quantity");
    return _.isNumber(qty) && qty >= 0;
  }),

  editable: Ember.computed.equal("state", "pending"),
  completed: Ember.computed.not("editable")
});
