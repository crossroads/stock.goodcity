import Ember from "ember";
import _ from "lodash";

export default Ember.Controller.extend({
  userService: Ember.inject.service(),
  user: Ember.computed.alias("model"),

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
  )
});
