import Ember from "ember";
import _ from "lodash";

export default Ember.Controller.extend({
  printerService: Ember.inject.service(),
  apiBaseService: Ember.inject.service(),
  userService: Ember.inject.service(),

  selectedPrinterId: "",
  user: Ember.computed.alias("model.user"),
  noAdminAppAccess: Ember.computed.equal("adminRoleAccess", "noAccess"),

  printers: Ember.computed(function() {
    return this.get("printerService").allAvailablePrinters();
  }),

  canUpdateRole: Ember.computed("user.id", function() {
    return this.get("userService").canUpdateRole(this.get("user.id"));
  }),

  selectedPrinterDisplay: Ember.computed(
    "model.user.id",
    "selectedPrinterId",
    function() {
      const printerId = this.get("selectedPrinterId");
      return this.get("userService").getPrinterForUser(
        this.get("user"),
        printerId,
        "admin"
      );
    }
  ),

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
      if (value === "accessTill") {
        this.set("roleExpiryDate", moment().format("DD/MMM/YYYY"));
      } else {
        this.set("roleExpiryDate", "");
      }

      return value;
    }
  }),

  observeExpiryDate: Ember.observer("roleExpiryDate", function() {
    if (
      this.get("roleExpiryDate") &&
      this.get("adminRoleAccess") !== "accessTill"
    ) {
      this.set("adminRoleAccess", "accessTill");
    }
  }),

  roleExpiryDate: Ember.computed("user.userRoles.[]", function() {
    let date = this.get("userService").getRoleExpiryDate(
      this.get("user"),
      "admin"
    );
    return date ? moment(date).format("DD/MMM/YYYY") : "";
  }),

  hasReviewerRole: Ember.computed("user.roles.[]", function() {
    return this.get("userService").hasRole(this.get("user"), "Reviewer");
  }),

  hasSupervisorRole: Ember.computed("user.roles.[]", function() {
    return this.get("userService").hasRole(this.get("user"), "Supervisor");
  }),

  noAdminAppRole: Ember.computed(
    "hasReviewerRole",
    "hasSupervisorRole",
    function() {
      return !this.get("hasReviewerRole") && !this.get("hasSupervisorRole");
    }
  ),

  savePrinter() {
    let printerId = this.get("selectedPrinterId");
    this.get("printerService").addDefaultPrinter(
      printerId,
      this.get("user.id"),
      "admin"
    );
  },

  updateUserRole(role, selectedRole, roleExpiryDate) {
    const roleId = this.get("userService").getRoleId(role);
    const userId = this.get("user.id");

    if (selectedRole) {
      this.get("userService").assignRole(userId, roleId, roleExpiryDate);
    } else {
      this.get("userService").deleteUserRole(userId, roleId);
    }
  },

  actions: {
    setPrinterValue(value) {
      const printerId = value.id;
      this.set("selectedPrinterId", printerId);
    },

    cancelForm() {
      this.set("selectedPrinterId", "");
      this.transitionToRoute("users.details", this.get("user.id"));
    },

    saveUserRoles() {
      let roleExpiryDate;
      let adminRoleAccess = this.get("adminRoleAccess");

      if (adminRoleAccess === "noAccess") {
        this.get("userService").deleteAdminRoles(this.get("user"));
      } else {
        if (this.get("canUpdateRole")) {
          if (adminRoleAccess === "accessTill") {
            roleExpiryDate = this.get("roleExpiryDate");
          }

          this.updateUserRole(
            "Reviewer",
            this.get("hasReviewerRole"),
            roleExpiryDate
          );
          this.updateUserRole(
            "Supervisor",
            this.get("hasSupervisorRole"),
            roleExpiryDate
          );
        }

        this.savePrinter();
      }
      this.transitionToRoute("users.details", this.get("user.id"));
    }
  }
});
