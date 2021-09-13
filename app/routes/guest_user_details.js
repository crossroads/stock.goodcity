import AuthorizeRoute from "./authorize";

export default AuthorizeRoute.extend({
  userService: Ember.inject.service(),

  beforeModel(transition) {
    this._super(...arguments);

    let user = this.get("store").peekRecord(
      "user",
      this.session.get("currentUser.id")
    );
    let hasActiveRole = user.get("activeRoles").length > 0;

    if (hasActiveRole) {
      transition.abort();
      this.transitionTo("index");
    }
  },

  model() {
    return this.get("store").peekRecord(
      "user",
      this.session.get("currentUser.id")
    );
  },

  setupController(controller, model) {
    this._super(controller, model);

    controller.set("firstName", model.get("firstName"));
    controller.set("lastName", model.get("lastName"));
    controller.set("email", model.get("email"));
    controller.set("selectedTitle", model.get("title") || "Mr");
    model.set("mobile", controller.getUserMobile());
  }
});
