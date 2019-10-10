import Ember from "ember";
import Model from "ember-data/model";
import attr from "ember-data/attr";
import { belongsTo, hasMany } from "ember-data/relationships";
import Detail from "./detail";

export default Detail.extends({
  createdAt: attr("date"),
  updatedAt: attr("date"),
  brand: attr("string"),
  model: attr("string"),
  serialNum: attr("string"),
  countryId: attr("number"),
  size: attr("string"),
  interface: attr("string"),
  compVoltage: attr("string"),
  compTestStatus: attr("string")
});
