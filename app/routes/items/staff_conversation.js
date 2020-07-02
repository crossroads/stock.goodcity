import AuthorizeRoute from "./../authorize";
import Ember from "ember";

export default AuthorizeRoute.extend({
  i18n: Ember.inject.service(),
  canManageItemsChat: Ember.computed.alias(
    "session.currentUser.canManageItemsChat"
  ),

  model(params) {
    return Ember.RSVP.hash({
      item: this.loadIfAbsent("item", params.item_id),
      messages: this.get("canManageItemsChat")
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

    if (this.get("canManageItemsChat")) {
      controller.send("markRead");
      controller.on();
    }
  },

  resetController(controller) {
    if (this.get("canManageItemsChat")) {
      controller.off();
    }
  }
});
