import AuthorizeRoute from "./../authorize";
import Ember from "ember";

export default AuthorizeRoute.extend({
  designationService: Ember.inject.service(),
  currentRouteName: null,

  model({ order_id }) {
    return this.loadIfAbsent("designation", order_id);
  },

  async afterModel() {
    await this.store.query("cancellation_reason", { for: "order" });
  }
});
