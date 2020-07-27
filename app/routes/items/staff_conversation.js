import AuthorizeRoute from "./../authorize";
import Ember from "ember";

export default AuthorizeRoute.extend({
  i18n: Ember.inject.service(),
  canManageItemMessages: Ember.computed.alias(
    "session.currentUser.canManageItemMessages"
  ),

  model(params) {
    return Ember.RSVP.hash({
      item: this.loadIfAbsent("item", params.item_id),
      messages: this.get("canManageItemMessages")
        ? this.store.query("message", {
            package_id: params.item_id,
            is_private: true
          })
        : []
    });
  },

  setupController(controller, model) {
    this._super(controller, model);
    controller.set("messages", model.messages);
    controller.set("model", model.item);
    controller.on();

    if (this.get("canManageItemMessages")) {
      controller.send("markRead");
    }
  },

  resetController(controller) {
    controller.off();
  }
});
