import detail from "./detail";
import Ember from "ember";
import _ from 'lodash';
const {  getOwner } = Ember;

export default detail.extend({
  body: '',
  ordersController: Ember.inject.controller('orders/index'),
  order: Ember.computed.alias("ordersController.model"),

  createMessage(values) {
    debugger
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

  allMessages: Ember.computed(function () {
    return this.store.peekAll("message");
  }),

  messages: Ember.computed("allMessages.[]", "order", function () {
    var messages = this.get("allMessages");
    messages.filterBy("order.id", this.get("item.id"));
    return messages.filterBy("isPrivate", this.get("isPrivate"));
  }),

  actions: {
    sendMessage(){
      var values = this.getProperties("body", "order");
      values.createdAt = new Date();
      values.sender = this.store.peekRecord("user", this.get("session.currentUser.id"));
      this.createMessage(values);
    }
  }
});


