import ApiBaseService from "./api-base-service";

export default ApiBaseService.extend({
  store: Ember.inject.service(),

  ordersCountFor(userId) {
    return this.GET(`/users/${userId}/orders_count`);
  },

  changeOrderState(order, state, opts = {}) {
    return this.PUT(`/orders/${order.id}/transition`, {
      transition: state,
      ...opts
    }).then(data => {
      data["designation"] = data["order"];
      this.get("store").pushPayload(data);
    });
  },

  cancelOrder(order, reason) {
    return this.changeOrderState(order, "cancel", reason);
  }
});
