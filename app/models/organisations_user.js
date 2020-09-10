import attr from "ember-data/attr";
import Model from "ember-data/model";
import { belongsTo } from "ember-data/relationships";
import _ from "lodash";

export default Model.extend({
  position: attr("string"),
  preferredContactNumber: attr("string"),
  organisationId: attr("number"),

  gcOrganisation: belongsTo("gcOrganisation", {
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
