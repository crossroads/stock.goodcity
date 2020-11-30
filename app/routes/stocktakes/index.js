import AuthorizeRoute from "../authorize";
import Ember from "ember";

export default AuthorizeRoute.extend({
  packageTypeService: Ember.inject.service(),

  model() {
    return Ember.RSVP.hash({
      codes: this.get("packageTypeService").preload(),
      stocktakes: this.store.findAll("stocktake", { reload: true })
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
