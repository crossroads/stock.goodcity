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
      const countryId = model && model.order.get("countryId");
      const countryName = model && model.order.get("countryName");

      controller.set("model", model.order);
      controller.set("codeWithoutPrefix", model.order.get("code").slice(1));
      controller.set("selectedCountry", { id: countryId, nameEn: countryName });
      controller.set("codeValidationError", false);
      controller.set("ordersCount", model.usersOrdersCount);
    }
  }
});
