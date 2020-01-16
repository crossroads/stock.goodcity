import AuthorizeRoute from "./../authorize";
import Ember from "ember";

export default AuthorizeRoute.extend({
  designationService: Ember.inject.service(),
  currentRouteName: null,

  model(params) {
    const id = params.order_id;
    return this.get("designationService")
      .getOrder(id)
      .then(() => this.loadIfAbsent("designation", id));
  }
});
