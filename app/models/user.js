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
  userRoleIds: attr(""),
  title: attr("string"),
  preferredLanguage: attr("string"),
  isEmailVerified: attr("boolean"),
  isMobileVerified: attr("boolean"),
  disabled: attr("boolean"),

  printersUsers: hasMany("printersUsers", { async: false }),

  image: belongsTo("image", {
    async: false
  }),

  address: belongsTo("address", {
    async: false
  }),

  associatedDistrict: Ember.computed("address", function() {
    return this.get("address.district");
  }),

  userRoles: hasMany("userRoles", {
    async: false
  }),

  activeUserRoles: Ember.computed(
    "userRoles.[]",
    "userRoles.@each.expiresAt",
    function() {
      return this.get("userRoles").filter(
        userRole =>
          !userRole.get("expiresAt") ||
          (userRole.get("expiresAt") &&
            moment.tz(userRole.get("expiresAt"), "Asia/Hong_Kong").isAfter())
      );
    }
  ),

  activeRoles: Ember.computed("activeUserRoles.[]", function() {
    return this.get("activeUserRoles").map(userRole => userRole.get("role"));
  }),

  roles: Ember.computed("userRoles.[]", function() {
    return this.get("userRoles").map(userRole => userRole.get("role"));
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

  mobileWithoutCountryCode: Ember.computed("mobile", function() {
    var phoneNumber = this.get("mobile");
    return phoneNumber ? phoneNumber.substring("4") : null;
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
