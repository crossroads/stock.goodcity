import DS from "ember-data";
import { belongsTo } from "ember-data/relationships";
var attr = DS.attr;

export default DS.Model.extend({
  event: attr("string"),
  itemType: attr("string"),
  itemId: attr("number"),
  whodunnit: attr("string"),
  whodunnitName: attr("string"),
  state: attr("string"),
  createdAt: attr("date"),
  item: belongsTo("item", {
    async: false
  })
});
