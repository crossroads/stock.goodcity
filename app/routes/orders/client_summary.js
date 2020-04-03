import detail from "./detail";

export default detail.extend({
  async model() {
    const order = await this._super(...arguments);
    return Ember.RSVP.hash({
      order,
      beneficiary: this.loadIfAbsent("beneficiary", order.get("beneficiaryId"))
    });
  },

  setupController(controller, model) {
    if (controller) {
      controller.set("model", model.order);
    }
  }
});
