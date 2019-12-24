import attr from "ember-data/attr";
import Ember from "ember";
import { hasMany } from "ember-data/relationships";
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
  intl: Ember.inject.service(),

  // permission:  belongsTo('permission', { async: false }),
  // image:       belongsTo('image', { async: false }),

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
      const intl = this.get("intl");
      if (!this.get("lastConnected") && !this.get("lastDisconnected")) {
        return intl.t("online_status.not_connected");
      } else if (this.get("lastDisconnected") > this.get("lastConnected")) {
        return false;
      } else if (this.get("lastDisconnected") < this.get("lastConnected")) {
        return intl.t("online_status.online");
      }
    }
  )
});
