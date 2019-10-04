import Ember from "ember";
import Model from "ember-data/model";
import attr from "ember-data/attr";
import { belongsTo, hasMany } from "ember-data/relationships";

export default Model.extend({
  brand: attr("string"),
  model: attr("string"),
  serialNumber: attr("string"),
  countryId: attr("number"),
  standard: attr("string"),
  voltage: attr("number"),
  frequency: attr("number"),
  power: attr("string"),
  systemOrRegion: attr("string"),
  testStatus: attr("string"),
  testedOn: attr("date"),
  createdAt: attr("date"),
  updatedAt: attr("date")
});