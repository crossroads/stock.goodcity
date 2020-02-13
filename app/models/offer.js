import Ember from "ember";
import DS from "ember-data";

var attr = DS.attr,
  hasMany = DS.hasMany,
  belongsTo = DS.belongsTo;

export default DS.Model.extend({
  language: attr("string"),
  state: attr("string", { defaultValue: "draft" }),
  origin: attr("string"),
  stairs: attr("boolean"),
  parking: attr("boolean"),
  saleable: attr("boolean"),
  estimatedSize: attr("string"),
  notes: attr("string"),
  createdById: attr("string"),
  createdAt: attr("date"),
  updatedAt: attr("date"),
  submittedAt: attr("date"),
  cancelledAt: attr("date"),
  state_event: attr("string"),
  reviewedAt: attr("date"),
  receivedAt: attr("date"),
  reviewCompletedAt: attr("date"),
  deliveredBy: attr("string"),
  startReceivingAt: attr("date"),
  cancelReason: attr("string"),
  inactiveAt: attr("date"),
  displayImageCloudinaryId: attr("string"),
  companyId: attr("string"),
  inventoriedPackageCount: attr("string"),
  unrecordedPackageCount: attr("string"),
  companyId: attr("string"),

  company: belongsTo("company", { async: false }),
  createdBy: belongsTo("user", { async: false }),
  offersPackages: hasMany("offersPackages", { async: false }),
  // User details
  userName: attr("string"),
  userPhone: attr("string")
});
