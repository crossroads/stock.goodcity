import detail from "./detail";

export default detail.extend({
  async setupController(controller, model = {}) {
    await this._super(controller, model);
    controller.set("ordersPkgLength", 0);
    controller.on();
  },

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.off();
    }
  }
});
