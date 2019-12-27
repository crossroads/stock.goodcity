import detail from "./detail";

export default detail.extend({
  async setupController(controller, model) {
    if (controller) {
      this._super(controller, model);
      controller.set("isActiveGoods", true);
    }
  }
});
