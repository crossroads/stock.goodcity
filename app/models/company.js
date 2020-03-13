import DS from "ember-data";
import Ember from "ember";
import { hasMany } from "ember-data/relationships";

var attr = DS.attr;

export default DS.Model.extend({
  name: attr("string"),
  crmId: attr("number"),
  createdById: attr("number"),
  updatedById: attr("number"),

  offers: hasMany("offers", {
    async: false
  })
});
