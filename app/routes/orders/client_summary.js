import detail from "./detail";

export default detail.extend({
  async model() {
    const order = await this._super(...arguments);
    if (order.get("beneficiaryId")) {
      return Ember.RSVP.hash({
        order,
        beneficiary: this.loadIfAbsent(
          "beneficiary",
          order.get("beneficiaryId")
        )
      });
    } else {
      return Ember.RSVP.hash({
        order
      });
    }
  },

  setupController(controller, model) {
    if (controller) {
      controller.set("model", model.order);
    }
  }
});
