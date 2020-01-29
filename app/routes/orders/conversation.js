import { hash } from "rsvp";
import detail from "./detail";

export default detail.extend({
  model(params) {
    return hash({
      designation:
        this.store.peekRecord("designation", params.order_id, {
          reload: true
        }) || this.store.findRecord("designation", params.order_id),
      messages: this.store.query("message", { order_id: params.order_id })
    });
  },

  afterModel(model) {
    //jshint ignore:line
    //Overriding to neglect afterModel in detail
  },

  setupController(controller, model) {
    controller.set("model", model.designation);
    controller.send("markRead");
    controller.on();
  },

  resetController(controller) {
    controller.off();
  }
});
