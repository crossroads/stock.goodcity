import AuthorizeRoute from "./../authorize";

export default AuthorizeRoute.extend({
  model(params) {
    return this.loadIfAbsent("designation", params.order_id);
  }
});
