import Ember from "ember";

export default Ember.Component.extend({
  messages: Ember.inject.service(),

  unreadMessageCount: Ember.computed.alias("messages.unreadMessageCount"),

  hasMessages: Ember.computed.bool("unreadMessageCount")
});
