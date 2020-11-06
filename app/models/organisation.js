import Model from "ember-data/model";
import attr from "ember-data/attr";
import Ember from "ember";
import { hasMany } from "ember-data/relationships";

export default Model.extend({
  nameEn: attr("string"),
  nameZhTw: attr("string"),
  descriptionEn: attr("string"),
  descriptionZhTw: attr("string"),
  website: attr("string"),
  registration: attr("string"),
  ordersCount: attr("string"),
  countryId: attr("string"),
  usersCount: Ember.computed.alias("organisationsUsers.length"),
  country: Ember.computed("countryId", function() {
    let countryId = this.get("countryId");
    if (countryId) {
      return this.store.peekRecord("country", this.get("countryId"));
    }
  }),
  organisationTypeId: attr("string"),
  organisationsUsers: hasMany("organisations_user", { async: false }),
  designations: hasMany("designation", { async: false })
});
