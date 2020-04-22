import AuthorizeRoute from "./authorize";

export default AuthorizeRoute.extend({
  resetController: function(controller, isExiting) {
    this._super.apply(this, arguments);

    if (isExiting) {
      controller.set("notifications", []);
      controller.set("hasLoadedReadMessages", false);
    }
  }
});
