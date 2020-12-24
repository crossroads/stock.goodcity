import Ember from "ember";
import config from "stock/config/environment";

import detail from "./detail";
import MessageBase from "stock/mixins/messages_base";
import { ROLES } from "stock/constants/roles";

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
  messageableType: "Order",
  messageableId: Ember.computed(function() {
    return this.get("order.id");
  }),

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

  on() {
    this.get("subscription").on("change:message", this, this.markReadAndScroll);
  },

  off() {
    this.get("subscription").off(
      "change:message",
      this,
      this.markReadAndScroll
    );
  },

  roles: Ember.computed(function() {
    const {
      STOCK_APP_ROLES: { ORDER_ADMINISTRATOR, ORDER_FULFILMENT }
    } = ROLES;
    return [ORDER_ADMINISTRATOR, ORDER_FULFILMENT];
  }),

  markReadAndScroll: function({ record }) {
    this.markMessageAsRead(record);
    this.scrollToBottom();
  },

  scrollToBottom() {
    if (!Ember.$(".message-textbar").length) {
      return;
    }

    let scrollOffset = Ember.$(document).height();
    let screenHeight = document.documentElement.clientHeight;
    let pageHeight = document.documentElement.scrollHeight;

    if (pageHeight > screenHeight) {
      Ember.run.later(this, function() {
        window.scrollTo(0, scrollOffset);
      });
    }
  },

  actions: {
    sendMessage() {
      Ember.$("textarea").trigger("blur");
      let values = this.prepareMessageObject("Order");
      this.createMessage(values);
    }
  }
});
