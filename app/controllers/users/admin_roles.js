import Ember from "ember";
import _ from "lodash";
import { ROLES } from "stock/constants/roles";
import { ACCESS_TYPES } from "stock/constants/access-types";

export default Ember.Controller.extend({
  printerService: Ember.inject.service(),
  apiBaseService: Ember.inject.service(),
  userService: Ember.inject.service(),

  selectedPrinterId: "",
  user: Ember.computed.alias("model.user"),
  noAdminAppAccess: Ember.computed.equal(
    "adminRoleAccess",
    ACCESS_TYPES.NO_ACCESS
  ),

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
      this.get("noAdminAppRole") &&
      this.get("adminRoleAccess") !== ACCESS_TYPES.NO_ACCESS
    );
  }),

  adminRoleAccess: Ember.computed("user.roles.[]", {
    get() {
      if (this.get("noAdminAppRole")) {
        return ACCESS_TYPES.NO_ACCESS;
      } else if (this.get("roleExpiryDate")) {
        return ACCESS_TYPES.LIMITED_ACCESS;
      } else {
        return ACCESS_TYPES.UNLIMITED_ACCESS;
      }
    },
    set(_, value) {
      if (value === ACCESS_TYPES.LIMITED_ACCESS) {
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
      this.get("adminRoleAccess") !== ACCESS_TYPES.LIMITED_ACCESS
    ) {
      this.set("adminRoleAccess", ACCESS_TYPES.LIMITED_ACCESS);
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
    return this.get("userService").hasRole(
      this.get("user"),
      ROLES.ADMIN_APP_ROLES.REVIEWER
    );
  }),

  hasSupervisorRole: Ember.computed("user.roles.[]", function() {
    return this.get("userService").hasRole(
      this.get("user"),
      ROLES.ADMIN_APP_ROLES.SUPERVISOR
    );
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

      if (adminRoleAccess === ACCESS_TYPES.NO_ACCESS) {
        this.get("userService").deleteAdminRoles(this.get("user"));
      } else {
        if (this.get("canUpdateRole")) {
          if (adminRoleAccess === ACCESS_TYPES.LIMITED_ACCESS) {
            roleExpiryDate = this.get("roleExpiryDate");
          }

          this.updateUserRole(
            ROLES.ADMIN_APP_ROLES.REVIEWER,
            this.get("hasReviewerRole"),
            roleExpiryDate
          );
          this.updateUserRole(
            ROLES.ADMIN_APP_ROLES.SUPERVISOR,
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
