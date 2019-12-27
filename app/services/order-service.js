import ApiBaseService from "./api-base-service";

export default ApiBaseService.extend({
  ordersCountFor(userId) {
    return this.GET(`/users/${userId}/orders_count`);
  },

  changeOrderState(order, params) {
    const url = `/orders/${order.id}/transition`;
    return this.PUT(url, params);
  }
});
