import AuthorizeRoute from "./authorize";

export default AuthorizeRoute.extend({
  userService: Ember.inject.service(),

  beforeModel(transition) {
    this._super(...arguments);

    let user = this.get("store").peekRecord(
      "user_profile",
      this.session.get("currentUser.id")
    );

    let hasActiveRole =
      user.get("activeRoles") && user.get("activeRoles").length > 0;
    let hasValidUserProfile =
      (user.get("firstName") || "").trim().length > 0 &&
      (user.get("lastName") || "").trim().length > 0;

    if (hasActiveRole || hasValidUserProfile) {
      transition.abort();
      this.transitionTo("index");
    }
  },

  model() {
    return this.get("store").peekRecord(
      "user_profile",
      this.session.get("currentUser.id")
    );
  },

  setupController(controller, model) {
    this._super(controller, model);

    const title = model.get("title") || "Mr";

    controller.set("firstName", model.get("firstName"));
    controller.set("lastName", model.get("lastName"));
    controller.set("email", model.get("email"));
    controller.set(
      "selectedTitle",
      controller.get("titles").findBy("id", title)
    );
    model.set("mobile", controller.getUserMobile());
  }
});
