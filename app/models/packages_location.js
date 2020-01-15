import { computed } from "@ember/object";
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

  quantityToMove: computed("quantity", function() {
    return this.get("quantity");
  }),

  siblingPackagesLocations: computed("itemId", function() {
    return this.get("item.packagesLocations");
  })
});
