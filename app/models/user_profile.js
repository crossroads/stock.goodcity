import Ember from "ember";
import DS from "ember-data";
import Addressable from "./addressable";
import _ from "lodash";

var attr = DS.attr;

export default Addressable.extend({
  firstName: attr("string"),
  lastName: attr("string"),
  mobile: attr("string"),
  disabled: attr("boolean"),
  maxRoleLevel: attr("number"),

  userRoles: DS.hasMany("userRoles", { async: false }),

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

  canManageStocktakeRevisions: Ember.computed("roles", function() {
    const roles = this.get("roles");
    return roles.find(
      r =>
        r.get("permissionNames").indexOf("can_manage_stocktake_revisions") >= 0
    );
  }),

  canDisableUsers: Ember.computed("roles", function() {
    const roles = this.get("roles");
    return roles.find(
      r => r.get("permissionNames").indexOf("can_disable_user") >= 0
    );
  }),

  mobileWithCountryCode: Ember.computed("mobile", function() {
    return this.get("mobile") ? "+852" + this.get("mobile") : "";
  }),

  fullName: Ember.computed("firstName", "lastName", function() {
    return this.get("firstName") + " " + this.get("lastName");
  })
});
