import AuthorizeRoute from "../authorize";
import Ember from "ember";

export default AuthorizeRoute.extend({
  packageTypeService: Ember.inject.service(),

  model({ stocktake_id }) {
    return Ember.RSVP.hash({
      codes: this.get("packageTypeService").preload(),
      stocktake: this.store.findRecord("stocktake", stocktake_id)
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
