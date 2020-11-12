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
  activeRoles: Ember.computed.alias("model.user.activeRoles"),

  noStockAppAccess: Ember.computed.equal(
    "stockRoleAccess",
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
        "stock"
      );
    }
  ),

  roleError: Ember.computed("noStockAppRole", "stockRoleAccess", function() {
    return (
      this.get("noStockAppRole") &&
      this.get("stockRoleAccess") !== ACCESS_TYPES.NO_ACCESS
    );
  }),

  stockRoleAccess: Ember.computed("user.roles.[]", {
    get() {
      if (this.get("noStockAppRole")) {
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
      this.get("stockRoleAccess") !== ACCESS_TYPES.LIMITED_ACCESS
    ) {
      this.set("stockRoleAccess", ACCESS_TYPES.LIMITED_ACCESS);
    }
  }),

  roleExpiryDate: Ember.computed("activeRoles.[]", {
    get() {
      let date = this.get("userService").getRoleExpiryDate(
        this.get("user"),
        "stock"
      );
      return date ? moment(date).format("DD/MMM/YYYY") : "";
    },
    set(_, value) {
      return value;
    }
  }),

  hasStockAdministratorRole: Ember.computed("activeRoles.[]", {
    get() {
      return this.get("userService").hasRole(
        this.get("user"),
        ROLES.STOCK_APP_ROLES.STOCK_ADMINISTRATOR
      );
    },
    set(_, value) {
      return value;
    }
  }),

  hasStockFulfilmentRole: Ember.computed("activeRoles.[]", {
    get() {
      return this.get("userService").hasRole(
        this.get("user"),
        ROLES.STOCK_APP_ROLES.STOCK_FULFILMENT
      );
    },
    set(_, value) {
      return value;
    }
  }),

  hasOrderAdministratorRole: Ember.computed("activeRoles.[]", {
    get() {
      return this.get("userService").hasRole(
        this.get("user"),
        ROLES.STOCK_APP_ROLES.ORDER_ADMINISTRATOR
      );
    },
    set(_, value) {
      return value;
    }
  }),

  hasOrderFulfilmentRole: Ember.computed("activeRoles.[]", {
    get() {
      return this.get("userService").hasRole(
        this.get("user"),
        ROLES.STOCK_APP_ROLES.ORDER_FULFILMENT
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

      if (stockRoleAccess === ACCESS_TYPES.NO_ACCESS) {
        this.get("userService").deleteStockRoles(this.get("user"));
      } else {
        if (this.get("canUpdateRole")) {
          if (stockRoleAccess === ACCESS_TYPES.LIMITED_ACCESS) {
            roleExpiryDate = this.get("roleExpiryDate");
          }

          this.updateUserRole(
            ROLES.STOCK_APP_ROLES.STOCK_FULFILMENT,
            this.get("hasStockFulfilmentRole"),
            roleExpiryDate
          );
          this.updateUserRole(
            ROLES.STOCK_APP_ROLES.STOCK_ADMINISTRATOR,
            this.get("hasStockAdministratorRole"),
            roleExpiryDate
          );
          this.updateUserRole(
            ROLES.STOCK_APP_ROLES.ORDER_FULFILMENT,
            this.get("hasOrderFulfilmentRole"),
            roleExpiryDate
          );
          this.updateUserRole(
            ROLES.STOCK_APP_ROLES.ORDER_ADMINISTRATOR,
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
