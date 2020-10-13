import ApiBaseService from "./api-base-service";

export default ApiBaseService.extend({
  store: Ember.inject.service(),

  ordersCountFor(userId) {
    return this.GET(`/users/${userId}/orders_count`);
  },

  fetchShipmentorCarryoutCode(detail_type) {
    return this.GET("/fetch_shipment_or_carryout_code", {
      detail_type: detail_type
    }).then(data => {
      return data.code;
    });
  },

  createShipmentorCarryoutOrder(params) {
    return this.POST("/orders", params);
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
