import { inject as service } from "@ember/service";
import Controller, { inject as controller } from "@ember/controller";
import { STATE_FILTERS } from "../services/filter-service";

export default Controller.extend({
  application: controller(),
  filterService: service(),

  actions: {
    logMeOut() {
      this.get("application").send("logMeOut");
    },

    goToOrder(states, priority = false) {
      let filterService = this.get("filterService");
      let stateFilter = [states];
      if (priority) {
        stateFilter.unshift(STATE_FILTERS.PRIORITY);
      }
      filterService.clearFilters();
      filterService.set("orderStateFilters", stateFilter);
      this.transitionToRoute("orders");
    }
  }
});
