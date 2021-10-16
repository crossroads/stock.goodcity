import AuthorizeRoute from "../authorize";
import Ember from "ember";

const requiresReload = (timeout => {
  const tracker = {};
  return id => {
    const lastVisit = tracker[id] || 0;
    const now = Date.now();
    tracker[id] = now;
    return now - lastVisit >= timeout;
  };
})(3 * 60 * 1000);

export default AuthorizeRoute.extend({
  model({ stocktake_id }) {
    return Ember.RSVP.hash({
      stocktake: this.store.findRecord("stocktake", stocktake_id, {
        reload: requiresReload(stocktake_id)
      })
    });
  },

  setupController(controller, { stocktake }) {
    controller.set("stocktake", stocktake);
    controller.set("selectedRevisionId", null);
    controller.on();
  },

  resetController(controller) {
    controller.off();
  }
});
