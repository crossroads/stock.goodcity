import Ember from "ember";
import DS from "ember-data";
import Addressable from "./addressable";
import _ from "lodash";
import { hasMany, belongsTo } from "ember-data/relationships";

var attr = DS.attr;

export default Addressable.extend({
  firstName: attr("string"),
  lastName: attr("string"),
  email: attr("string"),
  mobile: attr("string"),
  disabled: attr("boolean"),
  maxRoleLevel: attr("number"),
  title: attr("string"),

  userRoles: hasMany("userRoles", {
    async: false
  }),

  image: belongsTo("image", {
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

  roles: Ember.computed("userRoles.[]", function() {
    return this.get("userRoles").map(userRole => userRole.get("role"));
  }),

  roleNames: Ember.computed("roles", function() {
    if (this.get("roles.length")) {
      return this.get("roles").getEach("name");
    }
  }),

  isReviewer: Ember.computed("roleNames", function() {
    if (this.get("roleNames") && this.get("roleNames").length) {
      return this.get("roleNames").indexOf("Reviewer") >= 0;
    }
  }),

  isSupervisor: Ember.computed("roleNames", function() {
    if (this.get("roleNames") && this.get("roleNames").length) {
      return this.get("roleNames").indexOf("Supervisor") >= 0;
    }
  }),

  isOrderFulfilmentUser: Ember.computed("roleNames", function() {
    if (this.get("roleNames") && this.get("roleNames").length) {
      return this.get("roleNames").indexOf("Order fulfilment") >= 0;
    }
  }),

  isOrderAdministrator: Ember.computed("roleNames", function() {
    if (this.get("roleNames") && this.get("roleNames").length) {
      return this.get("roleNames").indexOf("Order administrator") >= 0;
    }
  }),

  canManageAppointments: Ember.computed("roles", function() {
    const roles = this.get("roles");
    return roles.find(
      r => r.get("permissionNames").indexOf("can_manage_settings") >= 0
    );
  }),

  canManageUsers: Ember.computed("roles", function() {
    const roles = this.get("roles");
    return roles.find(
      r => r.get("permissionNames").indexOf("can_read_or_modify_user") >= 0
    );
  }),

  canManageUserRoles: Ember.computed("roles", function() {
    const roles = this.get("roles");
    return roles.find(
      r => r.get("permissionNames").indexOf("can_manage_user_roles") >= 0
    );
  }),

  canManageOrders: Ember.computed("roles", function() {
    const roles = this.get("roles");
    return roles.find(
      r => r.get("permissionNames").indexOf("can_manage_orders") >= 0
    );
  }),

  canManageItemMessages: Ember.computed("roles", function() {
    const roles = this.get("roles");
    return roles.find(
      r => r.get("permissionNames").indexOf("can_manage_package_messages") >= 0
    );
  }),

  canManageStocktakes: Ember.computed("roles", function() {
    const roles = this.get("roles");
    return roles.find(
      r => r.get("permissionNames").indexOf("can_manage_stocktakes") >= 0
    );
  }),

  canManageAccessPasses: Ember.computed("roles", function() {
    const roles = this.get("roles");
    return roles.find(
      r => r.get("permissionNames").indexOf("can_manage_access_passes") >= 0
    );
  }),

  canManageStocktakeRevisions: Ember.computed("roles", function() {
    const roles = this.get("roles");
    return roles.find(
      r =>
        r.get("permissionNames").indexOf("can_manage_stocktake_revisions") >= 0
    );
  }),

  canManageOrganisationsUsers: Ember.computed("roles", function() {
    const roles = this.get("roles");
    return roles.find(
      r =>
        r.get("permissionNames").indexOf("can_manage_organisations_users") >= 0
    );
  }),

  canDisableUsers: Ember.computed("roles", function() {
    const roles = this.get("roles");
    return roles.find(
      r => r.get("permissionNames").indexOf("can_disable_user") >= 0
    );
  }),

  canMergeUsers: Ember.computed("roles", function() {
    const roles = this.get("roles");
    return roles.find(
      r => r.get("permissionNames").indexOf("can_merge_users") >= 0
    );
  }),

  mobileWithCountryCode: Ember.computed("mobile", function() {
    return this.get("mobile") ? "+852" + this.get("mobile") : "";
  }),

  fullName: Ember.computed("firstName", "lastName", function() {
    return this.get("firstName") + " " + this.get("lastName");
  })
});
