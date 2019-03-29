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
