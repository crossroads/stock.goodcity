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
  },

  /**
   * Deletes the beneficiary of an order (if it exists)
   *
   * @param {Order} order
   * @returns {Order}
   */
  async deleteBeneficiaryOf(order) {
    if (!order.get("beneficiaryId")) {
      return order;
    }

    await this.DELETE(`/beneficiaries/${order.get("beneficiaryId")}`);

    order.get("beneficiary").unloadRecord();
    order.set("beneficiary", null);
    order.set("beneficiaryId", null);

    return order;
  }
});
