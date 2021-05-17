import AuthorizeRoute from "../authorize";

export default AuthorizeRoute.extend({
  queryParams: {
    otherUserId: null
  },

  beforeModel({ queryParams = {}, params = {} }) {
    this._super(...arguments);

    const hasotherUserId = !!queryParams.otherUserId;
    const userId = params["users.merge_user"].user_id;

    if (
      !hasotherUserId ||
      (hasotherUserId && queryParams.otherUserId === userId)
    ) {
      this.replaceWith("users.details", userId);
    }
  },

  model(params) {
    return Ember.RSVP.hash({
      user: this.loadIfAbsent("user", params.user_id),
      otherUser: this.loadIfAbsent("user", params.otherUserId)
    });
  },

  setupController(controller, model) {
    this._super(controller, model);
  }
});
