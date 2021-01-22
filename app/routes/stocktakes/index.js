import AuthorizeRoute from "../authorize";
import Ember from "ember";

export default AuthorizeRoute.extend({
  model() {
    return Ember.RSVP.hash({
      stocktakes: this.store.query("stocktake", {
        include_revisions: false
      })
    });
  },

  setupController(controller, model) {
    controller.set("model", model);
    controller.on();
  },

  resetController(controller) {
    controller.off();
  }
});
