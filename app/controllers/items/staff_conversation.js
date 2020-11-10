import Ember from "ember";

import MessageBase from "stock/mixins/messages_base";
import AsyncMixin, { ERROR_STRATEGIES } from "stock/mixins/async";
import { ROLES } from "stock/constants/roles";
import _ from "lodash";

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

  roles: Ember.computed(function() {
    return _.values(ROLES["STOCK_APP_ROLES"]);
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
      let values = this.prepareMessageObject("Package");

      this.runTask(this.createMessage(values), ERROR_STRATEGIES.MODAL);
    }
  }
});
