import ApiBaseService from "./api-base-service";

export default ApiBaseService.extend({
  store: Ember.inject.service(),

  ordersCountFor(userId) {
    return this.GET(`/users/${userId}/orders_count`);
  },

  async fetchShipmentorCarryoutCode(detail_type) {
    const data = await this.GET("/fetch_shipment_or_carryout_code", {
      detail_type: detail_type
    });
    return data.code;
  },

  async createShipmentorCarryoutOrder(params) {
    const data = await this.POST("/orders", params);
    this.get("store").pushPayload(data);
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
