import Ember from "ember";
import DS from "ember-data";

var attr = DS.attr,
  hasMany = DS.hasMany,
  belongsTo = DS.belongsTo;

export default DS.Model.extend({
  inventoriedPackageCount: attr("string"),
  unrecordedPackageCount: attr("string"),
  companyId: attr("number"),
  createdById: attr("string"),
  company: belongsTo("company", { async: false }),
  createdBy: belongsTo("user", { async: false })
});
