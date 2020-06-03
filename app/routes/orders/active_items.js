import detail from "./detail";

export default detail.extend({
  async model({ order_id }) {
    const order = await this._super(...arguments);
    return Ember.RSVP.hash({
      order,
      gcRequests: this.store.query("goodcity_request", {
        order_ids: [order_id]
      })
    });
  },

  async setupController(controller, model = {}) {
    await this._super(controller, model.order);
    controller.set("ordersPkgLength", 0);
    controller.on();
  },

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.off();
    }
  }
});
