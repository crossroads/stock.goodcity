import detail from './detail';

export default detail.extend({
  async model() {
    const order = await this._super(...arguments);
    const requestObj = { order: order };
    if (order.get('beneficiaryId')) {
      requestObj.beneficiary = this.loadIfAbsent('beneficiary', order.get('beneficiaryId'));
    }
    return Ember.RSVP.hash({
      ...requestObj,
    });
  },

  setupController(controller, model) {
    if (controller) {
      controller.set('model', model.order);
      controller.set('selectedDistrict', model.order.district);
    }
  },
});
