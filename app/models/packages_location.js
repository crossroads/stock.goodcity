import Ember from "ember";
import Model from "ember-data/model";
import attr from "ember-data/attr";
import { belongsTo } from "ember-data/relationships";

export default Model.extend({
  packageId: attr("number"),
  itemId: attr("number"),
  quantity: attr("number"),
  locationId: attr("number"),

  location: belongsTo("location", { async: false }),
  item: belongsTo("item", { async: false }),

  defaultAddableQuantity: Ember.computed.oneWay("quantity"),

  quantityToMove: Ember.computed("quantity", function() {
    return this.get("quantity");
  }),

  siblingPackagesLocations: Ember.computed("itemId", function() {
    return this.get("item.packagesLocations");
  }),

  hasValidDefaultAddableQuantity: Ember.computed(
    "defaultAddableQuantity",
    function() {
      return this.get("defaultAddableQuantity") <= this.get("quantity");
    }
  )
});
