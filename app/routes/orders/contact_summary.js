import detail from "./detail";
import AjaxPromise from "stock/utils/ajax-promise"; //jshint ignore:line

export default detail.extend({
  async model() {
    const order = await this._super(...arguments);
    const userId = order.get("createdBy.id");

    return Ember.RSVP.hash({
      order,
      ordersCount: await new AjaxPromise(
        `/users/${userId}/orders_count`,
        "GET",
        this.session.get("authToken")
      )
    });
  },

  setupController(controller, model) {
    if (controller) {
      controller.set("model", model.order);
      controller.set("ordersCount", model.ordersCount);
      controller.set("isActiveSummary", true);
    }
  }
});
