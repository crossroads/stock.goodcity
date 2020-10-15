import Ember from "ember";
import attr from "ember-data/attr";
import Model from "ember-data/model";
import { belongsTo } from "ember-data/relationships";
import _ from "lodash";

export default Model.extend({
  position: attr("string"),
  preferredContactNumber: attr("string"),
  organisationId: attr("number"),
  status: attr("string"),

  isApproved: Ember.computed.equal("status", "approved"),
  isPendingApproval: Ember.computed.equal("status", "pending"),
  isActive: Ember.computed.or("isApproved", "isPendingApproval"),

  organisation: belongsTo("organisation", {
    async: false
  }),
  organisation: belongsTo("organisation", {
    async: false
  }),
  user_id: attr("string"),
  status: attr("string"),
  userStatus: Ember.computed("status", function() {
    return _.startCase(_.toLower(this.get("status")));
  }),
  user: belongsTo("user", {
    async: false
  })
});
