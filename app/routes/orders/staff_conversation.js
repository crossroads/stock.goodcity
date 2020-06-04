import conversation from "./conversation";
import Ember from "ember";

export default conversation.extend({
  templateName: "orders/conversation",

  model(params) {
    return Ember.RSVP.hash({
      designation:
        this.store.peekRecord("designation", params.order_id, {
          reload: true
        }) || this.store.findRecord("designation", params.order_id),
      messages: this.store.query("message", {
        order_id: params.order_id,
        is_private: true
      })
    });
  }
});
