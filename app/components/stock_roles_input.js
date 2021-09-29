import Ember from "ember";
import { ROLES } from "stock/constants/roles";

export default Ember.Component.extend({
  showStockRolesPopup: false,
  accessPassRoles: "",
  accessPassRoleIds: "",
  hasOrderFulfilmentRole: false,
  hasStockFulfilmentRole: false,

  userService: Ember.inject.service(),

  roleError: Ember.computed(
    "hasOrderFulfilmentRole",
    "hasStockFulfilmentRole",
    function() {
      return (
        !this.get("hasOrderFulfilmentRole") &&
        !this.get("hasStockFulfilmentRole")
      );
    }
  ),

  actions: {
    showStockRolesPopup() {
      this.set("showStockRolesPopup", true);
    },

    setAccessRoles() {
      let stockRole, orderRole, stockRoleId, orderRoleId;

      if (this.get("hasStockFulfilmentRole")) {
        stockRole = ROLES.STOCK_APP_ROLES.STOCK_FULFILMENT;
        stockRoleId = this.get("userService").getRoleId(stockRole);
      }

      if (this.get("hasOrderFulfilmentRole")) {
        orderRole = ROLES.STOCK_APP_ROLES.ORDER_FULFILMENT;
        orderRoleId = this.get("userService").getRoleId(orderRole);
      }

      this.set(
        "accessPassRoles",
        [stockRole, orderRole].filter(Boolean).join(", ")
      );
      this.set(
        "accessPassRoleIds",
        [stockRoleId, orderRoleId].filter(Boolean).join(", ")
      );
    },

    closeStockRolesPopup() {
      this.set("showStockRolesPopup", false);
      this.set("hasOrderFulfilmentRole", false);
      this.set("hasStockFulfilmentRole", false);
    }
  }
});
