import { hash } from "rsvp";
import getOrderRoute from "./get_order";

export default getOrderRoute.extend({
  model(params) {
    var order = this.store.peekRecord("designation", params.orderId);
    return hash({
      order: order || this.store.findRecord("designation", params.orderId),
      codes: this.store.query("code", { stock: true })
    });
  },

  setupController(controller, model) {
    this._super(controller, model);
    controller.set("quantity", 1);
  }
});
