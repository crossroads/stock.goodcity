import Ember from "ember";
import ApiBaseService from "./api-base-service";
import _ from "lodash";

export default ApiBaseService.extend({
  store: Ember.inject.service(),
  session: Ember.inject.service(),

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
  }
});
