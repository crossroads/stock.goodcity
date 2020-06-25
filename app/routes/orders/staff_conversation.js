import conversation from "./conversation";
import Ember from "ember";

export default conversation.extend({
  templateName: "orders/conversation",

  model(params) {
    return Ember.RSVP.hash({
      designation: this.loadIfAbsent("designation", params.order_id),
      messages: this.store.query("message", {
        order_id: params.order_id,
        is_private: true
      })
    });
  }
});
