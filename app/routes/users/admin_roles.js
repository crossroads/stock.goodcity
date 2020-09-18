import AuthorizeRoute from "../authorize";

export default AuthorizeRoute.extend({
  /* jshint ignore:start */
  model(params) {
    let user = this.loadIfAbsent("user", params.user_id);
    let roles = this.store.query("role", {});
    this.store.pushPayload(roles);

    return Ember.RSVP.hash({
      user,
      roles
    });
  },
  /* jshint ignore:end */

  setupController(controller, model) {
    this._super(controller, model);
    controller.set(
      "selectedPrinterId",
      controller.get("selectedPrinterDisplay.id")
    );
  }
});
