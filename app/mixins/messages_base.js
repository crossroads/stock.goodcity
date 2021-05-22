import Ember from "ember";

export default Ember.Mixin.create({
  body: "",
  messages: [],

  store: Ember.inject.service(),
  subscription: Ember.inject.service(),
  messagesUtil: Ember.inject.service("messages"),
  messageInProgress: false,

  sortProperties: ["createdAt: asc"],
  sortedMessages: Ember.computed.sort("messages", "sortProperties"),

  groupedMessages: Ember.computed("sortedMessages.[]", function() {
    return this.groupBy(this.get("sortedMessages"), "createdDate");
  }),

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
    if (!values) {
      return;
    }
    this.set("messageInProgress", true);

    var message = this.store.createRecord("message", values);
    message
      .save()
      .then(data => {
        this.set("body", "");
        this.get("messages").pushObject(data._internalModel);
        this.set("displayText", "");
      })
      .catch(error => {
        this.store.unloadRecord(message);
        throw error;
      })
      .finally(() => this.set("messageInProgress", false));
  },

  prepareMessageObject: function(messageableType) {
    const values = {};
    values.body = this.get("body").trim();
    values.body = Ember.Handlebars.Utils.escapeExpression(values.body || "");
    values.body = values.body.replace(/(\r\n|\n|\r)/gm, "<br>");
    if (!values.body) {
      return;
    }

    values.createdAt = new Date();
    values.isPrivate = this.get("isPrivate");
    values.sender = this.store.peekRecord(
      "user",
      this.get("session.currentUser.id")
    );

    values.messageableType = messageableType;
    values.messageableId = this.get("model.id");
    return values;
  },

  markMessageAsRead: function(record) {
    let message = this.store.peekRecord("message", record.id);
    if (
      !message ||
      message.get("isRead") ||
      !(
        message.get("messageableId") == this.get("model.id") &&
        message.get("messageableType") == this.get("model.messageableName") &&
        message.get("isPrivate") == this.get("isPrivate")
      )
    ) {
      return;
    }

    this.get("messages").pushObject(message._internalModel);
    this.get("messagesUtil").markRead(message);
  },

  actions: {
    markRead() {
      this.get("sortedMessages")
        .filterBy("state", "unread")
        .forEach(message => this.get("messagesUtil").markRead(message));
    },

    setMentionsActive: function(val) {
      this.set("isMentionsActive", val);
    },

    setMessageContext: function(message) {
      this.set("body", message.parsedText);
      this.set("displayText", message.displayText);
    }
  }
});
