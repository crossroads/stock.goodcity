import Ember from "ember";
import config from "stock/config/environment";
import detail from "./detail";
import MessageBase from "stock/mixins/messages_base";

export default detail.extend(MessageBase, {
  isPrivate: false,
  backLinkPath: "",
  isMobileApp: config.cordova.enabled,
  itemIdforHistoryRoute: null,
  organisationIdforHistoryRoute: null,
  i18n: Ember.inject.service(),
  model: null,
  noMessage: Ember.computed.empty("messages"),
  isMentionsActive: false,

  displayChatNote: Ember.computed(
    "noMessage",
    "disabled",
    "isMentionsActive",
    function() {
      return (
        this.get("noMessage") &&
        !this.get("isMentionsActive") &&
        !this.get("disabled")
      );
    }
  ),

  actions: {
    sendMessage() {
      let values = this.prepareMessageObject("Order");
      this.createMessage(values);
    }
  }
});
