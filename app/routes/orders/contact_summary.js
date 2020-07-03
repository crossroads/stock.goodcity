import detail from "./detail";
import AjaxPromise from "stock/utils/ajax-promise"; //jshint ignore:line

export default detail.extend({
  orderService: Ember.inject.service(),

  async model() {
    const order = await this._super(...arguments);
    const userId = order.get("createdBy.id");

    return Ember.RSVP.hash({
      order,
      usersOrdersCount: this.get("orderService").ordersCountFor(userId)
    });
  },

  setupController(controller, model) {
    if (controller) {
      controller.set("model", model.order);
      controller.set("ordersCount", model.usersOrdersCount);
    }
  }
});
