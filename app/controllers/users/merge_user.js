import Ember from "ember";
import AsyncMixin, { ERROR_STRATEGIES } from "stock/mixins/async";

export default Ember.Controller.extend(AsyncMixin, {
  user: Ember.computed.alias("model.user"),
  otherUser: Ember.computed.alias("model.otherUser"),
  userService: Ember.inject.service(),

  masterUserId: Ember.computed("user.id", {
    get() {
      return this.get("user.id");
    },
    set(_, value) {
      return value;
    }
  }),

  actions: {
    mergeUser() {
      const targetUserId = this.get("masterUserId");
      let sourceUserId = this.get("user.id");

      if (targetUserId === this.get("user.id")) {
        sourceUserId = this.get("otherUser.id");
      }

      this.runTask(
        this.get("userService")
          .mergeUser(sourceUserId, targetUserId)
          .then(() => {
            this.transitionToRoute("users.details", targetUserId);
          }),
        ERROR_STRATEGIES.MODAL
      );
    }
  }
});
