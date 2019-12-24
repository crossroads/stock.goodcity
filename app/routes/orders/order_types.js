// jshint ignore: start

import { all } from "rsvp";

import { inject as service } from "@ember/service";

import detail from "./detail";
import Cache from "../../utils/cache";

export default detail.extend({
  processingChecklist: service(),

  loadLookups: Cache.once(function() {
    const load = modelName => {
      return this.store
        .findAll(modelName)
        .then(data => this.store.pushPayload(data));
    };

    // Load dependent lookup tables
    return all(
      [
        "district",
        "gogovan_transport",
        "booking_type",
        "process_checklist"
      ].map(load)
    );
  }),

  loadDependencies(order) {
    return all(
      order
        .getWithDefault("ordersProcessChecklistIds", [])
        .map(id => this.loadIfAbsent("orders_process_checklist", id))
    );
  },

  async afterModel(model) {
    await this._super(...arguments);
    await all([this.loadLookups(), this.loadDependencies(model)]);
  },

  setupController(controller, model) {
    this._super(controller, model);
    controller.set("stickyNote.showCallToAction", true);
    controller.set("stickyNote.showSaveButton", false);
  }
});
