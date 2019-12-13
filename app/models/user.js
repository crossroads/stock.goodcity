import attr from "ember-data/attr";
import Ember from "ember";
import { hasMany, belongsTo } from "ember-data/relationships";
import Addressable from "./addressable";

export default Addressable.extend({
  firstName: attr("string"),
  lastName: attr("string"),
  mobile: attr("string"),
  createdAt: attr("date"),
  email: attr("string"),
  organisations_users_ids: attr(),
  lastConnected: attr("date"),
  lastDisconnected: attr("date"),
  i18n: Ember.inject.service(),
  printerId: attr("number"),
  printer: belongsTo("printer", { async: false }),
  userRoles: hasMany("userRoles", {
    async: false
  }),
  roles: hasMany("roles", {
    async: false
  }),

  fullName: Ember.computed("firstName", "lastName", function() {
    return this.get("firstName") + " " + this.get("lastName");
  }),

  organisations: hasMany("organisation", {
    async: false
  }),
  organisationsUsers: hasMany("organisationsUsers", {
    async: false
  }),

  position: Ember.computed("organisationsUsers.[]", function() {
    const organisationsUsers = this.get("organisationsUsers");
    return organisationsUsers.length
      ? organisationsUsers.get("firstObject.position")
      : "";
  }),

  preferredContactNumber: Ember.computed("organisationsUsers.[]", function() {
    let organisationsUser = this.get("organisationsUsers.firstObject");
    return organisationsUser
      ? organisationsUser.get("preferredContactNumber")
      : "";
  }),

  onlineStatusLabel: Ember.computed(
    "lastConnected",
    "lastDisconnected",
    function() {
      const i18n = this.get("i18n");
      if (!this.get("lastConnected") && !this.get("lastDisconnected")) {
        return i18n.t("online_status.not_connected");
      } else if (this.get("lastDisconnected") > this.get("lastConnected")) {
        return false;
      } else if (this.get("lastDisconnected") < this.get("lastConnected")) {
        return i18n.t("online_status.online");
      }
    }
  )
});
