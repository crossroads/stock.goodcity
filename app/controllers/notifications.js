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
    let route;

    if (notification.category === "message") {
      if (notification.messageable_type == "Package") {
        route = ["items.staff_conversation", notification.package_id];
      } else if (notification.messageable_type == "Order") {
        route = ["orders.conversation", notification.order_id];
      }
    } else {
      route = ["orders.active_items", notification.order_id];
    }

    notification.route = route;
  },

  redirectToOrderDetail: function(orderId) {
    this.transitionToRoute("orders.active_items", orderId);
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
