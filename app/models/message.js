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
  designationId: attr(),
  designation: belongsTo("designation", { async: false }),
  lookup: attr("string"),
  messageableType: attr("string"),
  messageableId: attr("string"),

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
          `<span class='mentioned'>@${lookup[key].display_name}</span>`
        );
      });
      return body;
    }
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
