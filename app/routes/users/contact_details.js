import AuthorizeRoute from "../authorize";

export default AuthorizeRoute.extend({
  model(params) {
    return Ember.RSVP.hash({
      district: this.store.query("district", {}),
      user: this.loadIfAbsent("user", params.user_id)
    });
  },

  setupController(controller, model) {
    this._super(controller, model);
    let phoneNumber =
      model.user.get("mobile") && model.user.get("mobile").slice(4);
    controller.set("mobileNumber", phoneNumber);
    controller.set("mobileInputError", false);
    controller.set("mobileValidationError", false);
  }
});
