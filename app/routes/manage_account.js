import AuthorizeRoute from "./authorize";

export default AuthorizeRoute.extend({
  model() {
    return Ember.RSVP.hash({
      user: this.loadIfAbsent("user", this.session.get("currentUser.id"))
    });
  },

  setupController(controller, model) {
    this._super(controller, model);
    controller.set(
      "selectedAdminPrinterId",
      controller.get("selectedAdminPrinterDisplay.id")
    );
    controller.set(
      "selectedStockPrinterId",
      controller.get("selectedStockPrinterDisplay.id")
    );
  }
});
