import detail from "./detail";
import Ember from "ember";

export default detail.extend({
  model(params) {
    return Ember.RSVP.hash({
      designation:
        this.store.peekRecord("designation", params.order_id, {
          reload: true
        }) || this.store.findRecord("designation", params.order_id),
      messages: this.store.query("message", {
        order_id: params.order_id,
        is_private: false
      })
    });
  },

  afterModel(model) {
    //jshint ignore:line
    //Overriding to neglect afterModel in detail
  },

  setupController(controller, model) {
    controller.set("messages", model.messages);
    controller.set("model", model.designation);
    controller.send("markRead");
    controller.on();
  },

  resetController(controller) {
    controller.off();
  }
});
