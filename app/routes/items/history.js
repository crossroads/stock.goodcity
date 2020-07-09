import Ember from "ember";
import AuthorizeRoute from "./../authorize";

export default AuthorizeRoute.extend({
  model(params) {
    const queryParams = {
      package_id: params.item_id,
      per_page: 100
    };
    return Ember.RSVP.hash({
      item: this.store.findRecord("item", params.item_id, { reload: true }),
      itemActions: this.store.query("item_action", queryParams)
    });
  },

  afterModel({ item }) {
    if (item.get("isPartOfSet")) {
      item.get("packageSet.items").forEach(item => {
        this.store.findRecord("item", item.get("id"), { reload: true });
      });
    }
  },

  setupController(controller, { item, itemActions }) {
    controller.set("model", item);
    controller.set("itemActions", itemActions);
  },

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.off();
    }
  }
});
