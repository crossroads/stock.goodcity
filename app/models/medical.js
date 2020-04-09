import attr from "ember-data/attr";
import { belongsTo } from "ember-data/relationships";
import Detail from "./detail";

export default Detail.extend({
  brand: attr("string"),
  model: attr("string"),
  serialNumber: attr("string"),
  countryId: attr("number"),
  expiry_date: attr("date"),
  createdAt: attr("date"),
  updatedAt: attr("date"),
  item: belongsTo("item")
});
