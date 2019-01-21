import detail from "./detail";
import Ember from "ember";

export default detail.extend({
  body: '',
  isPrivate: false,

  messages: Ember.computed("model", function(){
    return this.get('model.messages');
  }),

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

  ordersPackagesLengthMoreThenThree: Ember.observer('model', function () {
    console.log('Okay okay');
  }),

  actions: {
    sendMessage(){
      Ember.$("textarea").trigger('blur');
      var values = this.getProperties("body");
      values.designation = this.get('model.designation');
      values.createdAt = new Date();
      values.isPrivate = this.get('isPrivate');
      values.sender = this.store.peekRecord("user", this.get("session.currentUser.id"));
      this.createMessage(values);
    }
  }
});


