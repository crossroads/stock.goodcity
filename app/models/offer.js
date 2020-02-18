import Ember from "ember";
import DS from "ember-data";

var attr = DS.attr,
  hasMany = DS.hasMany,
  belongsTo = DS.belongsTo;

export default DS.Model.extend({
  inventoriedPackageCount: attr("string"),
  unrecordedPackageCount: attr("string"),
  companyId: attr("number"),
  company: belongsTo("company", { async: false })
});
