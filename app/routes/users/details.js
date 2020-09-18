import AuthorizeRoute from "../authorize";

export default AuthorizeRoute.extend({
  model(params) {
    return this.loadIfAbsent("user", params.user_id);
  }
});
