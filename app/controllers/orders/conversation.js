import Ember from "ember";
import config from "../../config/environment";
import detail from "./detail";

export default detail.extend({
  store: Ember.inject.service(),
  subscription: Ember.inject.service(),
  messagesUtil: Ember.inject.service("messages"),
  body: "",
  isPrivate: false,
  backLinkPath: "",
  isMobileApp: config.cordova.enabled,
  itemIdforHistoryRoute: null,
  organisationIdforHistoryRoute: null,
  i18n: Ember.inject.service(),
  sortProperties: ["createdAt: asc"],
  model: null,
  noMessage: Ember.computed.empty("model.messages"),

  displayChatNote: Ember.computed("noMessage", "disabled", function() {
    return this.get("noMessage") && !this.get("disabled");
  }),

  sortedMessages: Ember.computed.sort("model.messages", "sortProperties"),

  groupedMessages: Ember.computed("sortedMessages", function() {
    return this.groupBy(this.get("sortedMessages"), "createdDate");
  }),

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

  groupBy: function(content, key) {
    var result = [];
    var object, value;

    content.forEach(function(item) {
      value = item.get(key);
      object = result.findBy("value", value);
      if (!object) {
        object = {
          value: value,
          items: []
        };
        result.push(object);
      }
      return object.items.push(item);
    });
    return result.getEach("items");
  },

  createMessage(values) {
    var message = this.store.createRecord("message", values);
    message
      .save()
      .then(() => {
        this.set("body", "");
      })
      .catch(error => {
        this.store.unloadRecord(message);
        throw error;
      });
  },

  markReadAndScroll: function({ record }) {
    let message = this.store.peekRecord("message", record.id);
    if (
      !message ||
      message.get("isRead") ||
      message.get("designationId") != this.get("model.id")
    ) {
      return;
    }

    this.get("messagesUtil").markRead(message);

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
    setMessageContext: function(message) {
      this.set("body", message.parsedText);
      this.set("displayText", message.displayText);
    },

    sendMessage() {
      Ember.$("textarea").trigger("blur");
      const values = {};
      values.body = this.get("body");
      values.body = Ember.Handlebars.Utils.escapeExpression(values.body || "");
      values.body = values.body.replace(/(\r\n|\n|\r)/gm, "<br>");
      values.designation = this.get("model");
      values.createdAt = new Date();
      values.isPrivate = this.get("isPrivate");
      values.sender = this.store.peekRecord(
        "user",
        this.get("session.currentUser.id")
      );
      values.messageableType = "Order";
      values.messageableId = this.get("model.id");
      this.createMessage(values);
    },
    markRead() {
      this.get("sortedMessages")
        .filterBy("state", "unread")
        .forEach(message => this.get("messagesUtil").markRead(message));
    }
  }
});
