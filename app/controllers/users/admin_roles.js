import Ember from "ember";
import _ from "lodash";

export default Ember.Controller.extend({
  printerService: Ember.inject.service(),
  printers: [],
  defaultPrinter: "",
  user: Ember.computed.alias("model"),
  noAdminAppAccess: Ember.computed.equal("adminRoleAccess", "noAccess"),

  roleError: Ember.computed("noAdminAppRole", "adminRoleAccess", function() {
    return (
      this.get("noAdminAppRole") && this.get("adminRoleAccess") !== "noAccess"
    );
  }),

  adminRoleAccess: Ember.computed("user.roles.[]", {
    get() {
      if (this.get("noAdminAppRole")) {
        return "noAccess";
      } else if (this.get("roleExpiryDate")) {
        return "accessTill";
      } else {
        return "accessForever";
      }
    },
    set(_, value) {
      return value;
    }
  }),

  roleExpiryDate: Ember.computed("user.userRoles.[]", function() {
    let expiryDates = this.get("user.userRoles")
      .filter(
        row =>
          _.includes(["Reviewer", "Supervisor"], row.get("role.name")) &&
          !!row.get("expiryDate")
      )
      .map(row => row.get("expiryDate"));
    return _.max(expiryDates);
  }),

  hasReviewerRole: Ember.computed("user.roles.[]", {
    get() {
      return !!this.get("user.roles").find(
        role => role.get("name") === "Reviewer"
      );
    },
    set(_, value) {
      return value;
    }
  }),

  hasSupervisorRole: Ember.computed("user.roles.[]", {
    get() {
      return !!this.get("user.roles").find(
        role => role.get("name") === "Supervisor"
      );
    },
    set(_, value) {
      return value;
    }
  }),

  noAdminAppRole: Ember.computed(
    "hasReviewerRole",
    "hasSupervisorRole",
    function() {
      return !this.get("hasReviewerRole") && !this.get("hasSupervisorRole");
    }
  ),

  init() {
    let printers = this.get("printerService").allAvailablePrinters();

    this.set("printers", printers);
    this.set("defaultPrinter", printers[0]);
  },

  actions: {
    onPrinterChange() {},

    cancelForm() {},

    saveUserRoles() {}
  }
});
