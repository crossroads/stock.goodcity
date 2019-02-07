import Ember from "ember";
const {
  getOwner
} = Ember;

export default Ember.Service.extend({
  logger: Ember.inject.service(),
  session: Ember.inject.service(),

  markRead: function (message) {
    debugger
    if (message.get("isUnread")) {
      var adapter = getOwner(this).lookup("adapter:application");
      var url = adapter.buildURL("message", message.id) + "/mark_read";
      adapter.ajax(url, "PUT")
        .then(data => {
          delete data.message.id;
          message.setProperties(data.message);
        })
        .catch(error => this.get("logger").error(error));
    }
  },

  getMessageRoute(isPrivate, orderId) {
    debugger
    if (isPrivate) {
      console.log('isPrivate is true');
    } else{
      return ["order.messages", orderId];
    }
  },

  getRoute: function (message) {
    debugger
    var orderId = message.get ? message.get("order.id") : message.order_id;
    var isPrivate = message.get ? message.get("isPrivate") : message.is_private;
    isPrivate = isPrivate ? isPrivate.toString().toLowerCase() === "true" : false;

    var messageRoute = this.getMessageRoute(isPrivate, orderId);

    return messageRoute;
  }
});
