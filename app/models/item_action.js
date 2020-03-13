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
  })
});
