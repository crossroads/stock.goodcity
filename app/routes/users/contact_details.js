import AuthorizeRoute from "../authorize";

export default AuthorizeRoute.extend({
  model(params) {
    return Ember.RSVP.hash({
      district: this.store.query("district", {}),
      user:
        this.store.peekRecord("user", params.user_id) ||
        this.store.findRecord("user", params.user_id, {
          reload: true
        })
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
