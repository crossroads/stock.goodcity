import Ember from "ember";
import MessageBase from "stock/mixins/messages_base";
import AsyncMixin, { ERROR_STRATEGIES } from "stock/mixins/async";

export default Ember.Controller.extend(MessageBase, AsyncMixin, {
  isPrivate: true,

  canManageItemMessages: Ember.computed.alias(
    "session.currentUser.canManageItemMessages"
  ),

  on() {
    if (this.get("canManageItemMessages")) {
      this.get("subscription").on(
        "change:message",
        this,
        this.markReadAndScroll
      );
    }
  },

  off() {
    if (this.get("canManageItemMessages")) {
      this.get("subscription").off(
        "change:message",
        this,
        this.markReadAndScroll
      );
    }
  },

  actions: {
    sendMessage() {
      Ember.$("textarea").trigger("blur");
      let values = this.prepareMessageObject("Package");

      this.runTask(this.createMessage(values), ERROR_STRATEGIES.MODAL);
    }
  }
});
