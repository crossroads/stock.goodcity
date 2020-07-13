import Model from "ember-data/model";
import attr from "ember-data/attr";
import _ from "lodash";
import { belongsTo, hasMany } from "ember-data/relationships";

export default Model.extend({
  dirty: attr("boolean"),
  state: attr("string"),
  packageId: attr("number"),
  itemId: Ember.computed.alias("packageId"),
  item: belongsTo("item", { async: false }),
  stocktake: belongsTo("stocktake", { async: false }),
  quantity: attr("number"),

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

  diff: Ember.computed("quantity", "expectedQuantity", function() {
    return this.get("quantity") - this.get("expectedQuantity");
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

  isDifferent: Ember.computed("diff", function() {
    return this.get("diff") !== 0;
  }),

  isValid: Ember.computed("quantity", function() {
    const qty = this.get("quantity");
    return _.isNumber(qty) && qty >= 0;
  }),

  editable: Ember.computed.equal("state", "pending"),
  completed: Ember.computed.not("editable")
});
