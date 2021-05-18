import Ember from "ember";
import ApiBaseService from "./api-base-service";
import _ from "lodash";
import { ROLES } from "stock/constants/roles";

export default ApiBaseService.extend({
  store: Ember.inject.service(),
  session: Ember.inject.service(),
  printerService: Ember.inject.service(),
  messageBox: Ember.inject.service(),

  canUpdateRole(userId) {
    return (
      this.get("session.currentUser.canManageUserRoles") &&
      +this.get("session.currentUser.id") !== +userId
    );
  },

  currentUser() {
    return this.GET("/auth/current_user_profile");
  },

  getRoleId(roleName) {
    return this.get("store")
      .peekAll("role")
      .find(role => role.get("name") === roleName)
      .get("id");
  },

  getRoleExpiryDate(user, userType) {
    let roles =
      userType == "admin" ? ROLES.ADMIN_APP_ROLES : ROLES.STOCK_APP_ROLES;
    let expiryDates = user
      .get("activeUserRoles")
      .filter(
        row => _.includes(roles, row.get("role.name")) && !!row.get("expiresAt")
      )
      .map(row => row.get("expiresAt"));

    return _.max(expiryDates);
  },

  getRoleAccessText(user, userType) {
    let expiryDate = this.getRoleExpiryDate(user, userType);
    let hasNoRole =
      userType == "admin"
        ? this.hasNoAdminAppRole(user)
        : this.hasNoStockAppRole(user);

    if (hasNoRole) {
      return "No Access";
    } else if (expiryDate) {
      return "Access Untill " + moment(expiryDate).format("DD/MM/YY");
    } else {
      return "Access Forever";
    }
  },

  isPastDate(date) {
    return moment.tz(date, "Asia/Hong_Kong").isBefore();
  },

  getPrinterForUser(user, printerId, userType) {
    if (printerId) {
      const printer = this.get("store").peekRecord("printer", printerId);
      return {
        name: printer.get("name"),
        id: printer.id
      };
    } else {
      let printer = this.get("printerService").getDefaultPrinterForUser(
        user.get("id"),
        userType
      );
      return printer;
    }
  },

  hasRole(user, roleName) {
    return !!user
      .get("activeRoles")
      .find(role => role.get("name") === roleName);
  },

  hasNoAdminAppRole(user) {
    return (
      !this.hasRole(user, ROLES.ADMIN_APP_ROLES.REVIEWER) &&
      !this.hasRole(user, ROLES.ADMIN_APP_ROLES.SUPERVISOR)
    );
  },

  hasNoStockAppRole(user) {
    return (
      !this.hasRole(user, ROLES.STOCK_APP_ROLES.STOCK_ADMINISTRATOR) &&
      !this.hasRole(user, ROLES.STOCK_APP_ROLES.STOCK_FULFILMENT) &&
      !this.hasRole(user, ROLES.STOCK_APP_ROLES.ORDER_ADMINISTRATOR) &&
      !this.hasRole(user, ROLES.STOCK_APP_ROLES.ORDER_FULFILMENT)
    );
  },

  createUser(userParams) {
    return this.POST(`/users`, userParams);
  },

  editUser(userId, userParams) {
    return this.PUT(`/users/${userId}`, userParams);
  },

  deleteImage(img) {
    img.deleteRecord();
    return img.save();
  },

  saveImage(img) {
    return img.save();
  },

  deleteUserRole(userId, roleId) {
    let userRole = this.get("store")
      .peekAll("user_role")
      .find(
        userRole =>
          userRole.get("roleId") === +roleId &&
          userRole.get("userId") === +userId
      );
    userRole &&
      userRole.destroyRecord().catch(jqXHR => {
        userRole.rollbackAttributes();
        this.get("messageBox").alert(
          _.get(jqXHR, "errors[0].detail.message.error")
        );
      });
  },

  assignRole(userId, roleId, date) {
    if (date) {
      date = moment(date)
        .set("hour", 20)
        .set("minutes", 0)
        .format("LLLL");
    }

    this.POST(`/user_roles`, {
      user_role: {
        role_id: +roleId,
        user_id: +userId,
        expires_at: date
      }
    })
      .then(data => this.get("store").pushPayload(data))
      .catch(jqXHR => {
        this.get("messageBox").alert(
          _.get(jqXHR, "responseJSON.errors[0].message.error")
        );
      });
  },

  deleteAdminRoles(user) {
    const userId = user.get("id");

    if (this.canUpdateRole(userId)) {
      const userRoleIds = user.get("roles").map(role => role.id);
      const reviewerRoleId = this.getRoleId(ROLES.ADMIN_APP_ROLES.REVIEWER);
      const supervisorRoleId = this.getRoleId(ROLES.ADMIN_APP_ROLES.SUPERVISOR);

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
        this.getRoleId(ROLES.STOCK_APP_ROLES.STOCK_ADMINISTRATOR),
        this.getRoleId(ROLES.STOCK_APP_ROLES.STOCK_FULFILMENT),
        this.getRoleId(ROLES.STOCK_APP_ROLES.ORDER_ADMINISTRATOR),
        this.getRoleId(ROLES.STOCK_APP_ROLES.ORDER_FULFILMENT)
      ];

      _.each(stockAppRoleIds, stockRoleId => {
        if (_.includes(userRoleIds, stockRoleId)) {
          this.deleteUserRole(userId, stockRoleId);
        }
      });
    }
  },

  mergeUser(sourceUserId, targetUserId) {
    return this.PUT(`/users/merge_users`, {
      master_user_id: targetUserId,
      merged_user_id: sourceUserId
    }).then(data => this.get("store").pushPayload(data));
  }
});
