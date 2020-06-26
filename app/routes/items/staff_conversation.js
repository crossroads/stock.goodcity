import AuthorizeRoute from "./../authorize";
import Ember from "ember";

export default AuthorizeRoute.extend({
  model(params) {
    return Ember.RSVP.hash({
      item: this.loadIfAbsent("item", params.item_id),
      messages: this.store.query("message", {
        package_id: params.item_id,
        is_private: true
      })
    });
  },

  setupController(controller, model) {
    this._super(controller, model);
    controller.set("messages", model.messages);
    controller.set("model", model.item);
    controller.send("markRead");
  }
});
