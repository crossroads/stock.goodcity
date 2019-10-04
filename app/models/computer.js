import Ember from "ember";
import Model from "ember-data/model";
import attr from "ember-data/attr";
import { belongsTo, hasMany } from "ember-data/relationships";

export default Model.extend({
  createdAt: attr("date"),
  updatedAt: attr("date"),
  brand: attr("string"),
  model: attr("string"),
  countryId: attr("number"),
  size: attr("string"),
  cpu: attr("string"),
  ram: attr("string"),
  hdd: attr("string"),
  optical: attr("string"),
  video: attr("string"),
  sound: attr("string"),
  lan: attr("string"),
  wireless: attr("string"),
  usb: attr("string"),
  compVoltage: attr("string"),
  compTestStatus: attr("string"),
  os: attr("string"),
  osSerialNum: attr("string"),
  msOfficeSerialNum: attr("string"),
  marOsSerialNum: attr("string"),
  marMsOfficeSerialNum: attr("string")
});