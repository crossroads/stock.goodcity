import attr from "ember-data/attr";
import belongsTo from "ember-data/relationships";
import Detail from "./detail";

export default Detail.extend({
  brand: attr("string"),
  model: attr("string"),
  serialNumber: attr("string"),
  countryId: attr("number"),
  standard: attr("string"),
  voltage: attr("string"),
  frequency: attr("string"),
  power: attr("string"),
  systemOrRegion: attr("string"),
  testStatus: attr("string"),
  createdAt: attr("date"),
  updatedAt: attr("date"),
  item: belongsTo("item")
});
