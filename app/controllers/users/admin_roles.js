import Ember from "ember";
import _ from "lodash";

export default Ember.Controller.extend({
  printerService: Ember.inject.service(),
  apiBaseService: Ember.inject.service(),
  userService: Ember.inject.service(),

  appRoles: ["Reviewer", "Supervisor"],
  selectedPrinterId: "",

  user: Ember.computed.alias("model.user"),
  noAdminAppAccess: Ember.computed.equal("adminRoleAccess", "noAccess"),

  printers: Ember.computed(function() {
    return this.get("printerService").allAvailablePrinters();
  }),

  canUpdateRole: Ember.computed(function() {
    return (
      this.get("session.currentUser.isAdministrator") &&
      this.get("session.currentUser.canManageUserRoles") &&
      +this.get("session.currentUser.id") !== +this.get("user.id")
    );
  }),

  selectedPrinterDisplay: Ember.computed("model.user.id", "selectedPrinterId", {
    get() {
      const printerId = this.get("selectedPrinterId");
      return this.get("userService").getPrinterForUser(
        this.get("user"),
        printerId,
        "admin"
      );
    },
    set(_, value) {
      return value;
    }
  }),

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

  roleExpiryDate: Ember.computed("user.userRoles.[]", {
    get() {
      return this.get("userService").getRoleExpiryDate(
        this.get("user"),
        this.get("appRoles")
      );
    },
    set(_, value) {
      return value;
    }
  }),

  hasReviewerRole: Ember.computed("user.roles.[]", {
    get() {
      return this.get("userService").hasRole(this.get("user"), "Reviewer");
    },
    set(_, value) {
      return value;
    }
  }),

  hasSupervisorRole: Ember.computed("user.roles.[]", {
    get() {
      return this.get("userService").hasRole(this.get("user"), "Supervisor");
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
      let userRoleIds = this.get("user.roles").map(role => role.id);
      let adminRoleAccess = this.get("adminRoleAccess");

      const reviewerRoleId = this.get("userService").getRoleId("Reviewer");
      const supervisorRoleId = this.get("userService").getRoleId("Supervisor");
      const userId = this.get("user.id");

      if (adminRoleAccess === "noAccess") {
        if (_.includes(userRoleIds, reviewerRoleId)) {
          this.get("userService").deleteUserRole(userId, reviewerRoleId);
        }

        if (_.includes(userRoleIds, supervisorRoleId)) {
          this.get("userService").deleteUserRole(userId, supervisorRoleId);
        }
      } else {
        if (adminRoleAccess === "accessTill") {
          roleExpiryDate = this.get("roleExpiryDate");
        }

        if (this.get("hasReviewerRole")) {
          this.get("userService").assignRole(
            userId,
            reviewerRoleId,
            roleExpiryDate
          );
        } else {
          this.get("userService").deleteUserRole(userId, reviewerRoleId);
        }

        if (this.get("hasSupervisorRole")) {
          this.get("userService").assignRole(
            userId,
            supervisorRoleId,
            roleExpiryDate
          );
        } else {
          this.get("userService").deleteUserRole(userId, supervisorRoleId);
        }

        let printerId = this.get("selectedPrinterId");
        this.get("printerService").addDefaultPrinter(
          printerId,
          userId,
          "admin"
        );

        this.transitionToRoute("users.details", userId);
      }
    }
  }
});
