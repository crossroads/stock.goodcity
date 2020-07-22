import AuthorizeRoute from "./authorize";

export default AuthorizeRoute.extend({
  setupController(controller, model) {
    this._super(controller, model);
    controller.on();
  },

  resetController: function(controller, isExiting) {
    this._super.apply(this, arguments);

    if (isExiting) {
      controller.set("notifications", []);
    }

    controller.off();
  }
});
