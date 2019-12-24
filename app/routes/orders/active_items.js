import detail from "./detail";

export default detail.extend({
  async setupController(controller, model) {
    if (controller) {
      this._super(controller, model);
      const cancellationReasons = await this.fetchCancellationReason();
      controller.set("cancellationReason", cancellationReasons);
      controller.set("isActiveGoods", true);
    }
  },

  fetchCancellationReason() {
    return this.store.query("cancellation_reason", { isStock: true });
  }
});
