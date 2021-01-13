import AuthorizeRoute from "../authorize";
import Ember from "ember";

export default AuthorizeRoute.extend({
  model({ stocktake_id }) {
    return Ember.RSVP.hash({
      stocktake: this.store.findRecord("stocktake", stocktake_id, {
        reload: true
      })
    });
  },

  setupController(controller, { stocktake }) {
    controller.set("stocktake", stocktake);
    controller.on();
  },

  resetController(controller) {
    controller.off();
  }
});
