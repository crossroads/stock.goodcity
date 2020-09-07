import Ember from "ember";
import _ from "lodash";

export default Ember.Controller.extend({
  printerService: Ember.inject.service(),
  apiBaseService: Ember.inject.service(),
  userService: Ember.inject.service(),

  appRoles: [
    "Stock administrator",
    "Stock fulfilment",
    "Order administrator",
    "Order fulfilment"
  ],
  selectedPrinterId: "",

  user: Ember.computed.alias("model.user"),
  noStockAppAccess: Ember.computed.equal("stockRoleAccess", "noAccess"),

  printers: Ember.computed(function() {
    return this.get("printerService").allAvailablePrinters();
  }),

  canUpdateRole: Ember.computed("user.id", function() {
    return this.get("userService").canUpdateRole(this.get("user.id"));
  }),

  selectedPrinterDisplay: Ember.computed("model.user.id", "selectedPrinterId", {
    get() {
      const printerId = this.get("selectedPrinterId");
      return this.get("userService").getPrinterForUser(
        this.get("user"),
        printerId,
        "stock"
      );
    },
    set(_, value) {
      return value;
    }
  }),

  roleError: Ember.computed("noStockAppRole", "stockRoleAccess", function() {
    return (
      this.get("noStockAppRole") && this.get("stockRoleAccess") !== "noAccess"
    );
  }),

  stockRoleAccess: Ember.computed("user.roles.[]", {
    get() {
      if (this.get("noStockAppRole")) {
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

  hasStockAdministratorRole: Ember.computed("user.roles.[]", {
    get() {
      return this.get("userService").hasRole(
        this.get("user"),
        "Stock administrator"
      );
    },
    set(_, value) {
      return value;
    }
  }),

  hasStockFulfilmentRole: Ember.computed("user.roles.[]", {
    get() {
      return this.get("userService").hasRole(
        this.get("user"),
        "Stock fulfilment"
      );
    },
    set(_, value) {
      return value;
    }
  }),

  hasOrderAdministratorRole: Ember.computed("user.roles.[]", {
    get() {
      return this.get("userService").hasRole(
        this.get("user"),
        "Order administrator"
      );
    },
    set(_, value) {
      return value;
    }
  }),

  hasOrderFulfilmentRole: Ember.computed("user.roles.[]", {
    get() {
      return this.get("userService").hasRole(
        this.get("user"),
        "Order fulfilment"
      );
    },
    set(_, value) {
      return value;
    }
  }),

  noStockAppRole: Ember.computed(
    "hasStockAdministratorRole",
    "hasStockFulfilmentRole",
    "hasOrderAdministratorRole",
    "hasOrderFulfilmentRole",
    function() {
      return (
        !this.get("hasStockAdministratorRole") &&
        !this.get("hasStockFulfilmentRole") &&
        !this.get("hasOrderAdministratorRole") &&
        !this.get("hasOrderFulfilmentRole")
      );
    }
  ),

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
      let stockRoleAccess = this.get("stockRoleAccess");
      const userId = this.get("user.id");

      if (stockRoleAccess === "noAccess") {
        this.get("userService").deleteStockRoles(this.get("user"));
      } else {
        if (this.get("canUpdateRole")) {
          if (stockRoleAccess === "accessTill") {
            roleExpiryDate = this.get("roleExpiryDate");
          }

          this.updateUserRole(
            "Stock fulfilment",
            this.get("hasStockFulfilmentRole"),
            roleExpiryDate
          );
          this.updateUserRole(
            "Stock administrator",
            this.get("hasStockAdministratorRole"),
            roleExpiryDate
          );
          this.updateUserRole(
            "Order fulfilment",
            this.get("hasOrderFulfilmentRole"),
            roleExpiryDate
          );
          this.updateUserRole(
            "Order administrator",
            this.get("hasOrderAdministratorRole"),
            roleExpiryDate
          );
        }

        let printerId = this.get("selectedPrinterId");
        this.get("printerService").addDefaultPrinter(
          printerId,
          userId,
          "stock"
        );
      }

      this.transitionToRoute("users.details", userId);
    }
  }
});
