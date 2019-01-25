import Ember from "ember";
import config from '../../config/environment';
import detail from './detail'

export default detail.extend({
  body: '',
  isPrivate: false,
  backLinkPath: "",
  isMobileApp: config.cordova.enabled,
  itemIdforHistoryRoute: null,
  organisationIdforHistoryRoute: null,
  i18n: Ember.inject.service(),
  sortProperties: ["id"],
  model: null,

  sortedMessages: Ember.computed.sort("model.messages", "sortProperties"),

  createMessage(values) {
    var message = this.store.createRecord("message", values);
    message.save()
    .then(() => {
      this.set("body", "");
    })
    .catch(error => {
      this.store.unloadRecord(message);
      throw error;
    });
  },

  actions: {
    sendMessage(){
      Ember.$("textarea").trigger('blur');
      var values = this.getProperties("body");
      values.designation = this.get('model');
      values.createdAt = new Date();
      values.isPrivate = this.get('isPrivate');
      values.sender = this.store.peekRecord("user", this.get("session.currentUser.id"));
      this.createMessage(values);
    }
  }
});
