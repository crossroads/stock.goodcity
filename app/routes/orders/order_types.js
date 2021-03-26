// jshint ignore: start

import detail from "./detail";
import Cache from "../../utils/cache";
import Ember from "ember";

export default detail.extend({
  processingChecklist: Ember.inject.service(),

  loadLookups() {
    // Load dependent lookup tables
    return Ember.RSVP.all(
      ["gogovan_transport", "booking_type", "process_checklist"].map(model =>
        !this.store.peekAll(model).get("length")
          ? this.store.findAll(model)
          : this.store.peekAll(model)
      )
    );
  },

  loadDependencies(order) {
    return Ember.RSVP.all([
      this.store.query("orders_process_checklist", {
        order_id: order.get("id")
      })
    ]);
  },

  async afterModel(model) {
    await this._super(...arguments);
    await Promise.all([this.loadLookups(), this.loadDependencies(model)]);
  },

  setupController(controller, model) {
    this._super(controller, model);
    controller.set("stickyNote.showCallToAction", true);
    controller.set("stickyNote.showSaveButton", false);
  }
});
