import detail from "./detail";
import AjaxPromise from "stock/utils/ajax-promise"; //jshint ignore:line

export default detail.extend({
  async setupController(controller, model) {
    if (controller) {
      this._super(controller, model);
      let userId = model.get("createdBy.id");
      let ordersCount = await new AjaxPromise(
        `/users/${userId}/orders_count`,
        "GET",
        this.session.get("authToken")
      );
      controller.set("ordersCount", ordersCount);
      controller.set("isActiveSummary", true);
    }
  }
});
