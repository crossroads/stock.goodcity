import Ember from "ember";
import MessageBase from "stock/mixins/messages_base";

export default Ember.Controller.extend(MessageBase, {
  isPrivate: true,

  canManageItemMessages: Ember.computed.alias(
    "session.currentUser.canManageItemMessages"
  ),

  actions: {
    sendMessage() {
      Ember.$("textarea").trigger("blur");
      let values = this.prepareMessageObject("Package");
      this.createMessage(values);
    }
  }
});
