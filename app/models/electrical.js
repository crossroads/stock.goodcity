import attr from "ember-data/attr";
import { belongsTo } from "ember-data/relationships";
import Detail from "./detail";

export default Detail.extend({
  brand: attr("string"),
  model: attr("string"),
  serialNumber: attr("string"),
  countryId: attr("number"),
  standard: attr("string"),
  testStatusId: attr("number"),
  testStatus: belongsTo("lookup"),
  frequencyId: attr("number"),
  frequency: belongsTo("lookup"),
  voltageId: attr("number"),
  voltage: belongsTo("lookup"),
  power: attr("string"),
  systemOrRegion: attr("string"),
  createdAt: attr("date"),
  updatedAt: attr("date"),
  item: belongsTo("item")
});
