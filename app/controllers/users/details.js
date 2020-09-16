import Ember from "ember";
import _ from "lodash";
import AsyncMixin, { ERROR_STRATEGIES } from "stock/mixins/async";

export default Ember.Controller.extend(AsyncMixin, {
  userService: Ember.inject.service(),
  user: Ember.computed.alias("model"),
  disableUserPopupVisible: false,
  enableUserPopupVisible: false,
  isDisabledUser: Ember.computed.alias("user.disabled"),
  canDisableUsers: Ember.computed.alias("session.currentUser.canDisableUsers"),

  adminRoleAccess: Ember.computed(
    "user.activeRoles.@each.expiresAt",
    function() {
      return this.get("userService").getRoleAccessText(
        this.get("user"),
        "admin"
      );
    }
  ),

  stockRoleAccess: Ember.computed(
    "user.activeRoles.@each.expiresAt",
    function() {
      return this.get("userService").getRoleAccessText(
        this.get("user"),
        "stock"
      );
    }
  ),

  disableUserAccount(disabled) {
    if (this.get("canDisableUsers")) {
      let user = this.get("user");

      this.runTask(async () => {
        user.set("disabled", disabled);
        await user.save();
      }, ERROR_STRATEGIES.MODAL);
    }
  },

  actions: {
    disableUser() {
      this.disableUserAccount(true);
    },

    cancelDisableUser() {
      this.set("disableUserPopupVisible", false);
      this.set("enableUserPopupVisible", false);
    },

    displayDisableUserPopup() {
      this.set("disableUserPopupVisible", true);
    },

    displayEnableUserPopup() {
      this.set("enableUserPopupVisible", true);
    },

    enableUser() {
      this.disableUserAccount(false);
    }
  }
});
