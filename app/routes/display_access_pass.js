import AuthorizeRoute from "./authorize";

export default AuthorizeRoute.extend({
  queryParams: {
    code: ""
  },

  beforeModel(transition) {
    this._super(...arguments);

    const hasCode = !!transition.queryParams.code;

    if (!hasCode) {
      transition.abort();
      this.transitionTo("access_pass");
    }
  }
});
