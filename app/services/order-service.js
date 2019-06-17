import ApiBaseService from "./api-base-service";

export default ApiBaseService.extend({
  ordersCountFor(userId) {
    return this.GET(`/users/${userId}/orders_count`);
  },

  updateOrder(orderId, body) {
    return this.PUT(`/orders/${orderId}`, body);
  }
});
