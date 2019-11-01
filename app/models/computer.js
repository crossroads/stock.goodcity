import attr from "ember-data/attr";
import { belongsTo } from "ember-data/relationships";
import Detail from "./detail";

export default Detail.extend({
  createdAt: attr("date"),
  updatedAt: attr("date"),
  brand: attr("string"),
  model: attr("string"),
  countryId: attr("number"),
  serialNum: attr("string"),
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
  marMsOfficeSerialNum: attr("string"),
  item: belongsTo("item")
});
