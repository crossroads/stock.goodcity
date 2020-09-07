import Ember from "ember";
import ApiBaseService from "./api-base-service";
import _ from "lodash";

export default ApiBaseService.extend({
  store: Ember.inject.service(),
  session: Ember.inject.service(),
  printerService: Ember.inject.service(),

  canUpdateRole(userId) {
    return (
      this.get("session.currentUser.isAdministrator") &&
      this.get("session.currentUser.canManageUserRoles") &&
      +this.get("session.currentUser.id") !== +userId
    );
  },

  getRoleId(roleName) {
    return this.get("store")
      .peekAll("role")
      .find(role => role.get("name") === roleName)
      .get("id");
  },

  getRoleExpiryDate(user, roles) {
    let expiryDates = user
      .get("userRoles")
      .filter(
        row =>
          _.includes(roles, row.get("role.name")) && !!row.get("expiryDate")
      )
      .map(row => row.get("expiryDate"));

    let date = _.max(expiryDates);
    return date ? moment(date).format("DD/MMM/YYYY") : "";
  },

  getPrinterForUser(user, printerId, app) {
    if (printerId) {
      const printer = this.get("store").peekRecord("printer", printerId);
      return {
        name: printer.get("name"),
        id: printer.id
      };
    } else {
      let printer = this.get("printerService").getDefaultPrinterForUser(
        user.get("id"),
        app
      );
      return printer;
    }
  },

  hasRole(user, roleName) {
    return !!user.get("roles").find(role => role.get("name") === roleName);
  },

  deleteUserRole(userId, roleId) {
    let userRole = this.get("store")
      .peekAll("user_role")
      .find(
        userRole =>
          userRole.get("roleId") === +roleId &&
          userRole.get("userId") === +userId
      );
    userRole && userRole.destroyRecord();
  },

  assignRole(userId, roleId, date) {
    this.POST(`/user_roles`, {
      user_role: {
        role_id: +roleId,
        user_id: +userId,
        expiry_date: date
      }
    }).then(data => this.get("store").pushPayload(data));
  },

  deleteAdminRoles(user) {
    const userId = user.get("id");

    if (this.canUpdateRole(userId)) {
      const userRoleIds = user.get("roles").map(role => role.id);
      const reviewerRoleId = this.getRoleId("Reviewer");
      const supervisorRoleId = this.getRoleId("Supervisor");

      if (_.includes(userRoleIds, reviewerRoleId)) {
        this.deleteUserRole(userId, reviewerRoleId);
      }

      if (_.includes(userRoleIds, supervisorRoleId)) {
        this.deleteUserRole(userId, supervisorRoleId);
      }
    }
  },

  deleteStockRoles(user) {
    const userId = user.get("id");

    if (this.canUpdateRole(userId)) {
      const userRoleIds = user.get("roles").map(role => role.id);
      const stockAppRoleIds = [
        this.getRoleId("Stock administrator"),
        this.getRoleId("Stock fulfilment"),
        this.getRoleId("Order administrator"),
        this.getRoleId("Order fulfilment")
      ];

      _.each(stockAppRoleIds, stockRoleId => {
        if (_.includes(userRoleIds, stockRoleId)) {
          this.deleteUserRole(userId, stockRoleId);
        }
      });
    }
  }
});
