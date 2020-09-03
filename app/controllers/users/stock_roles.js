import Ember from "ember";
import _ from "lodash";

export default Ember.Controller.extend({
  printerService: Ember.inject.service(),
  apiBaseService: Ember.inject.service(),
  userService: Ember.inject.service(),

  selectedPrinterId: "",

  user: Ember.computed.alias("model.user"),
  noStockAppAccess: Ember.computed.equal("stockRoleAccess", "noAccess"),

  printers: Ember.computed(function() {
    return this.get("printerService").allAvailablePrinters();
  }),

  selectedPrinterDisplay: Ember.computed(
    "model.user.id",
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
        let printer = this.get("printerService").getDefaultPrinterForUser(
          this.get("user.id")
        );
        this.set("selectedPrinterId", printer.id);
        return printer;
      }
    }
  ),

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
      return this.get("userService").getRoleExpiryDate(this.get("user"), [
        "Stock administrator",
        "Stock fulfilment",
        "Order administrator",
        "Order fulfilment"
      ]);
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
      let stockRoleAccess = this.get("stockRoleAccess");

      const userId = this.get("user.id");
      const stockAdministratorRoleId = this.get("userService").getRoleId(
        "Stock administrator"
      );
      const stockFulfilmentRoleId = this.get("userService").getRoleId(
        "Stock fulfilment"
      );
      const orderAdministratorRoleId = this.get("userService").getRoleId(
        "Order administrator"
      );
      const orderFulfilmentRoleId = this.get("userService").getRoleId(
        "Order fulfilment"
      );

      if (stockRoleAccess === "noAccess") {
        stockAppRoleIds = [
          stockAdministratorRoleId,
          stockFulfilmentRoleId,
          orderAdministratorRoleId,
          orderFulfilmentRoleId
        ];

        _.each(stockAppRoleIds, stockRoleId => {
          if (_.includes(userRoleIds, stockRoleId)) {
            this.get("userService").deleteUserRole(userId, stockRoleId);
          }
        });
      } else {
        if (stockRoleAccess === "accessTill") {
          roleExpiryDate = this.get("roleExpiryDate");
        }

        if (this.get("hasStockFulfilmentRole")) {
          this.get("userService").assignRole(
            userId,
            stockFulfilmentRoleId,
            roleExpiryDate
          );
        } else {
          this.get("userService").deleteUserRole(userId, stockFulfilmentRoleId);
        }

        if (this.get("hasStockAdministratorRole")) {
          this.get("userService").assignRole(
            userId,
            stockAdministratorRoleId,
            roleExpiryDate
          );
        } else {
          this.get("userService").deleteUserRole(
            userId,
            stockAdministratorRoleId
          );
        }

        if (this.get("hasOrderFulfilmentRole")) {
          this.get("userService").assignRole(
            userId,
            orderFulfilmentRoleId,
            roleExpiryDate
          );
        } else {
          this.get("userService").deleteUserRole(userId, orderFulfilmentRoleId);
        }

        if (this.get("hasOrderAdministratorRole")) {
          this.get("userService").assignRole(
            userId,
            orderAdministratorRoleId,
            roleExpiryDate
          );
        } else {
          this.get("userService").deleteUserRole(
            userId,
            orderAdministratorRoleId
          );
        }

        let printerId = this.get("selectedPrinterId");
        this.get("printerService").addDefaultPrinter(printerId, userId);

        this.transitionToRoute("users.details", userId);
      }
    }
  }
});
