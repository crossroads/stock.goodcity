import AuthorizeRoute from "./../authorize";

export default AuthorizeRoute.extend({
  model(params) {
    return this.store.findRecord("item", params.item_id, { reload: true });
  },

  afterModel(model) {
    if (model.get("isPartOfSet")) {
      model.get("packageSet.items").forEach(item => {
        this.store.findRecord("item", item.get("id"), { reload: true });
      });
    }
  },

  setupController(controller, model) {
    controller.set("model", model);
    controller.on();
  },

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.off();
    }
  }
});
