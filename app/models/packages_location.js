import Ember from "ember";
import Model from "ember-data/model";
import attr from "ember-data/attr";
import { belongsTo } from "ember-data/relationships";

export default Model.extend({
  defaultQuantity: attr("number", { defaultValue: 0 }),
  packageId: attr("number"),
  itemId: attr("number"),
  quantity: attr("number"),
  locationId: attr("number"),

  location: belongsTo("location", { async: false }),
  item: belongsTo("item", { async: false }),

  quantityToMove: Ember.computed("quantity", function() {
    return this.get("quantity");
  }),

  siblingPackagesLocations: Ember.computed("itemId", function() {
    return this.get("item.packagesLocations");
  }),

  isDefaultQuantityValid: Ember.computed("defaultQuantity", function() {
    return this.get("defaultQuantity") <= this.get("quantity");
  })
});
