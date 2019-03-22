import Ember from "ember";

export default Ember.Controller.extend({
  subscription: Ember.inject.service(),
  model: Ember.computed({
    get() {
      return [];
    },
    set(key, value) {
      return value;
    }
  }),

  nextNotification: Ember.computed("model.[]", function() {
    //retrieveNotification is not implemented here because it needs to call itself
    return this.retrieveNotification();
  }),

  init() {
    this._super(...arguments);
    this.get("subscription").on("notification", this, this.onNewNotification);
  },

  onNewNotification(notification) {
    notification.date = new Date(notification.date);
    this.get("model").pushObject(notification);
  },

  retrieveNotification: function(index) {
    // not sure why but model.firstObject is undefined when there's one notification
    var notification = this.get("model") && this.get("model")[index || 0];
    if (!notification) {
      return null;
    }

    this.setRoute(notification);

    return notification;
  },

  setRoute: function(notification) {
    if (notification.category === "message") {
      return (notification.route = [
        "orders.conversation",
        notification.order_id
      ]);
    }
    notification.route = ["orders.detail", notification.order_id];
  },

  redirectToOrderDetail: function(orderId) {
    this.transitionToRoute("orders.detail", orderId);
  },

  actions: {
    view() {
      var notification = this.get("nextNotification");
      this.get("model").removeObject(notification);
      this.transitionToRoute.apply(this, notification.route);
    },

    unloadNotifications() {
      this.set("model", []);
    }
  }
});
