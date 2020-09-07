import Ember from "ember";
import attr from "ember-data/attr";
import Model from "ember-data/model";
import { belongsTo } from "ember-data/relationships";

export default Model.extend({
  position: attr("string"),
  preferredContactNumber: attr("string"),
  organisationId: attr("number"),
  status: attr("string"),

  isApproved: Ember.computed.equal("status", "approved"),
  isPendingApproval: Ember.computed.equal("status", "pending"),
  isActive: Ember.computed.or("isApproved", "isPendingApproval"),

  gcOrganisation: belongsTo("gcOrganisation", {
    async: false
  }),
  organisation: belongsTo("organisation", {
    async: false
  }),
  user: belongsTo("user", {
    async: false
  })
});
