import attr from "ember-data/attr";
import { belongsTo } from "ember-data/relationships";
import Detail from "./detail";

export default Detail.extend({
  createdAt: attr("date"),
  updatedAt: attr("date"),
  brand: attr("string"),
  model: attr("string"),
  serialNum: attr("string"),
  countryId: attr("number"),
  size: attr("string"),
  interface: attr("string"),
  compVoltage: attr("string"),
  compTestStatusId: attr("number"),
  compTestStatus: belongsTo("lookup"),
  item: belongsTo("item")
});
