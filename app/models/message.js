import Ember from "ember";
import DS from "ember-data";
var attr = DS.attr,
  belongsTo = DS.belongsTo;

export default DS.Model.extend({
  session: Ember.inject.service(),
  body: attr("string"),
  isPrivate: attr("boolean"),
  createdAt: attr("date"),
  updatedAt: attr("date"),
  senderId: attr("number"),
  state: attr("string", {
    defaultValue: "read"
  }),

  sender: belongsTo("user", {
    async: false
  }),
  designation: belongsTo("designation", { async: false }),
  item: belongsTo("item", {
    async: false
  }),

  designationId: attr(),
  itemId: attr(),
  lookup: attr("string"),
  messageableType: attr("string"),
  messageableId: attr("string"),
  unreadCount: attr("string"),

  parsedBody: Ember.computed("body", function() {
    let body = this.get("body");
    let lookup = this.get("lookup");
    if (!lookup) {
      return body;
    } else {
      lookup = JSON.parse(lookup);
      Object.keys(lookup).forEach(key => {
        body = body.replace(
          new RegExp(`\\[:${key}\\]`, "g"),
          `<span class='mentioned-message-display'>@${
            lookup[key].display_name
          }</span>`
        );
      });
      return body;
    }
  }),

  plainBody: Ember.computed("body", function() {
    let body = this.get("body");
    let lookup = this.get("lookup");

    if (Object.keys(lookup).length === 0) {
      return body;
    } else {
      lookup = JSON.parse(lookup);
      Object.keys(lookup).forEach(key => {
        body = body.replace(
          new RegExp(`\\[:${key}\\]`, "g"),
          lookup[key].display_name
        );
      });
    }
    return body;
  }),

  myMessage: Ember.computed("sender", function() {
    return this.get("sender.id") === this.get("session.currentUser.id");
  }),

  isMessage: Ember.computed("this", function() {
    return true;
  }),

  createdDate: Ember.computed("createdAt", function() {
    return new Date(this.get("createdAt")).toDateString();
  }),

  isRead: Ember.computed.equal("state", "read"),
  isUnread: Ember.computed.equal("state", "unread")
});
