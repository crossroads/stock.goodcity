import AuthorizeRoute from "./authorize";

export default AuthorizeRoute.extend({
  model(params) {
    return (
      this.store.peekRecord("user", params.user_id) ||
      this.store.findRecord("user", params.user_id, {
        reload: true
      })
    );
  }
});
