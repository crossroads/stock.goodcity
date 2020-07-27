import Ember from "ember";
import AuthorizeRoute from "./../authorize";

export default AuthorizeRoute.extend({
  packageService: Ember.inject.service(),

  model({ item_id }) {
    const queryParams = {
      package_id: item_id,
      per_page: 100
    };
    return Ember.RSVP.hash({
      item: this.store.findRecord("item", item_id, { reload: true }),
      itemActions: this.store.query("item_action", queryParams),
      versions: this.get("packageService").getPackageVersions(item_id)
    });
  },

  afterModel({ item }) {
    if (item.get("isPartOfSet")) {
      item.get("packageSet.items").forEach(item => {
        this.store.findRecord("item", item.get("id"), { reload: true });
      });
    }
  },

  setupController(controller, { item, itemActions, versions }) {
    controller.set("model", item);
    controller.set("versions", versions);
    controller.set("itemActions", itemActions);
  },

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.off();
    }
  }
});
