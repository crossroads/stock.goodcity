import Ember from "ember";
import Model from "ember-data/model";
import { hasMany } from "ember-data/relationships";
import attr from "ember-data/attr";

export default Model.extend({
  name: attr("string"),
  value: attr("string"),
  labelEn: attr("string"),
  labelZhTw: attr("string")
});
