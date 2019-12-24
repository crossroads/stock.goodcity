import { computed } from "@ember/object";
import DS from "ember-data";
import Addressable from "./addressable";

var attr = DS.attr;

export default Addressable.extend({
  firstName: attr("string"),
  lastName: attr("string"),
  mobile: attr("string"),

  userRoles: DS.hasMany("userRoles", { async: false }),

  roles: computed("userRoles.[]", function() {
    return this.get("userRoles").map(userRole => userRole.get("role"));
  }),

  roleNames: computed("roles", function() {
    if (this.get("roles.length")) {
      return this.get("roles").getEach("name");
    }
  }),

  isReviewer: computed("roleNames", function() {
    if (this.get("roleNames") && this.get("roleNames").length) {
      return this.get("roleNames").indexOf("Reviewer") >= 0;
    }
  }),

  isSupervisor: computed("roleNames", function() {
    if (this.get("roleNames") && this.get("roleNames").length) {
      return this.get("roleNames").indexOf("Supervisor") >= 0;
    }
  }),

  isOrderFulfilmentUser: computed("roleNames", function() {
    if (this.get("roleNames") && this.get("roleNames").length) {
      return this.get("roleNames").indexOf("Order fulfilment") >= 0;
    }
  }),

  canViewDashboard: computed(
    "isOrderFulfilmentUser",
    "isSupervisor",
    function() {
      return this.get("isOrderFulfilmentUser") || this.get("isSupervisor");
    }
  ),

  canManageAppointments: computed("roles", function() {
    const roles = this.get("roles");
    return roles.find(
      r => r.get("permissionNames").indexOf("can_manage_settings") >= 0
    );
  }),

  mobileWithCountryCode: computed("mobile", function() {
    return this.get("mobile") ? "+852" + this.get("mobile") : "";
  }),

  fullName: computed("firstName", "lastName", function() {
    return this.get("firstName") + " " + this.get("lastName");
  })
});
