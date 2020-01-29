import { inject as service } from "@ember/service";
import AuthorizeRoute from "./../authorize";

export default AuthorizeRoute.extend({
  designationService: service(),
  currentRouteName: null,

  model(params) {
    const id = params.order_id;
    return this.get("designationService")
      .getOrder(id)
      .then(() => this.loadIfAbsent("designation", id));
  }
});
