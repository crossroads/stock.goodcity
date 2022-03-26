import ApiBaseService from './api-base-service';

export default ApiBaseService.extend({
  store: Ember.inject.service(),

  ordersCountFor(userId) {
    return this.GET(`/users/${userId}/orders_count`);
  },

  async getNextCode(detail_type) {
    const data = await this.GET('/orders/next_code', {
      detail_type: detail_type,
    });
    return data;
  },

  async createShipmentOrCarryoutOrder(params) {
    const data = await this.POST('/orders', params);
    this.get('store').pushPayload(data);
    return data;
  },

  async updateShipmentOrCarryoutOrder(order, params) {
    const data = await this.PUT(`/orders/${order.id}`, params);
    this.get('store').pushPayload(data);
    return data;
  },

  changeOrderState(order, state, opts = {}) {
    return this.PUT(`/orders/${order.id}/transition`, {
      transition: state,
      ...opts,
    }).then(data => {
      data['designation'] = data['order'];
      this.get('store').pushPayload(data);
    });
  },

  async updateAddress(order, addressAttributes) {
    const addressId = order.getWithDefault('addressId');
    const identity = addressId ? { id: addressId } : {};

    return this.PUT(`/orders/${order.id}`, {
      order: {
        address_attributes: {
          ...addressAttributes,
          ...identity,
        },
      },
    }).then(data => {
      data['designation'] = data['order'];
      this.get('store').pushPayload(data);
    });
  },

  async updateOrder(order, params) {
    const data = await this.PUT(`/orders/${order.id}`, params);
    this.get('store').pushPayload(data);
  },

  cancelOrder(order, reason) {
    return this.changeOrderState(order, 'cancel', reason);
  },

  /**
   * Deletes the beneficiary of an order (if it exists)
   *
   * @param {Order} order
   * @returns {Order}
   */
  async deleteBeneficiaryOf(order) {
    if (!order.get('beneficiaryId')) {
      return order;
    }

    await this.DELETE(`/beneficiaries/${order.get('beneficiaryId')}`);

    order.get('beneficiary').unloadRecord();
    order.set('beneficiary', null);
    order.set('beneficiaryId', null);

    return order;
  },
});
