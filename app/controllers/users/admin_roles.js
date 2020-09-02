import Ember from "ember";
import _ from "lodash";

export default Ember.Controller.extend({
  printerService: Ember.inject.service(),
  apiBaseService: Ember.inject.service(),

  user: Ember.computed.alias("model"),
  noAdminAppAccess: Ember.computed.equal("adminRoleAccess", "noAccess"),

  printers: Ember.computed(function() {
    return this.get("printerService").allAvailablePrinters();
  }),

  selectedPrinterDisplay: Ember.computed(
    "model.id",
    "selectedPrinterId",
    function() {
      const printerId = this.get("selectedPrinterId");
      if (printerId) {
        const printer = this.store.peekRecord("printer", printerId);
        return {
          name: printer.get("name"),
          id: printer.id
        };
      } else {
        return this.get("printerService").getDefaultPrinterForUser(
          this.get("user.id")
        );
      }
    }
  ),

  roleError: Ember.computed("noAdminAppRole", "adminRoleAccess", function() {
    return (
      this.get("noAdminAppRole") && this.get("adminRoleAccess") !== "noAccess"
    );
  }),

  reviewerRoleId: Ember.computed(function() {
    return this.store
      .peekAll("role")
      .find(role => role.get("name") === "Reviewer")
      .get("id");
  }),

  supervisorRoleId: Ember.computed(function() {
    return this.store
      .peekAll("role")
      .find(role => role.get("name") === "Supervisor")
      .get("id");
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

  roleExpiryDate: Ember.computed("user.userRoles.[]", {
    get() {
      let expiryDates = this.get("user.userRoles")
        .filter(
          row =>
            _.includes(["Reviewer", "Supervisor"], row.get("role.name")) &&
            !!row.get("expiryDate")
        )
        .map(row => row.get("expiryDate"));

      let date = _.max(expiryDates);
      return date ? moment(date).format("DD/MMM/YYYY") : "";
    },
    set(_, value) {
      return value;
    }
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

  deleteUserRole(roleId) {
    let userRole = this.get("store")
      .peekAll("user_role")
      .find(
        userRole =>
          userRole.get("roleId") === +roleId &&
          userRole.get("userId") === +this.get("user.id")
      );
    userRole && userRole.destroyRecord();
  },

  assignRole(roleId, date) {
    this.get("apiBaseService")
      .POST(`/user_roles`, {
        user_role: {
          role_id: roleId,
          user_id: +this.get("user.id"),
          expiry_date: date
        }
      })
      .then(data => this.get("store").pushPayload(data));
  },

  actions: {
    setPrinterValue(value) {
      const printerId = value.id;
      this.set("selectedPrinterId", printerId);
    },

    cancelForm() {},

    saveUserRoles() {
      let roleExpiryDate;
      let userRoleIds = this.get("user.roles").map(role => role.id);

      let adminRoleAccess = this.get("adminRoleAccess");

      if (adminRoleAccess === "noAccess") {
        if (_.includes(userRoleIds, this.get("reviewerRoleId"))) {
          this.deleteUserRole(this.get("reviewerRoleId"));
        }

        if (_.includes(userRoleIds, this.get("supervisorRoleId"))) {
          this.deleteUserRole(this.get("supervisorRoleId"));
        }
      } else {
        if (adminRoleAccess === "accessTill") {
          roleExpiryDate = this.get("roleExpiryDate");
        }

        if (this.get("hasReviewerRole")) {
          this.assignRole(this.get("reviewerRoleId"), roleExpiryDate);
        }

        if (this.get("hasSupervisorRole")) {
          this.assignRole(this.get("supervisorRoleId"), roleExpiryDate);
        }

        let printerId = this.get("selectedPrinterId");
        this.get("printerService").addDefaultPrinter(
          printerId,
          this.get("user.id")
        );
      }
    }
  }
});
