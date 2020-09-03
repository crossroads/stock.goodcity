import Ember from "ember";
import ApiBaseService from "./api-base-service";

export default ApiBaseService.extend({
  store: Ember.inject.service(),
  session: Ember.inject.service(),

  getRoleId(roleName) {
    return this.get("store")
      .peekAll("role")
      .find(role => role.get("name") === roleName)
      .get("id");
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
