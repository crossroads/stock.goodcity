import ApiBaseService from "./api-base-service";

export default ApiBaseService.extend({
  store: Ember.inject.service(),

  ordersCountFor(userId) {
    return this.GET(`/users/${userId}/orders_count`);
  },

  changeOrderState(order, params) {
    return this.PUT(`/orders/${order.id}/transition`, params).then(data => {
      data["designation"] = data["order"];
      this.get("store").pushPayload(data);
    });
  }
});
