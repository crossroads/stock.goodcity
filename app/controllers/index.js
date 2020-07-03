import Ember from "ember";
import { STATE_FILTERS, TYPE_FILTERS } from "stock/services/filter-service";

export default Ember.Controller.extend({
  application: Ember.inject.controller(),
  filterService: Ember.inject.service(),

  actions: {
    logMeOut() {
      this.get("application").send("logMeOut");
    },

    goToOrder(states, priority = false) {
      let filterService = this.get("filterService");
      let stateFilter = [states];
      const { APPOINTMENT, ONLINE_ORDER } = TYPE_FILTERS;
      if (priority) {
        stateFilter.unshift(STATE_FILTERS.PRIORITY);
      }
      filterService.clearFilters();
      filterService.set("orderStateFilters", stateFilter);
      filterService.set("orderTypeFilters", [APPOINTMENT, ONLINE_ORDER]);
      this.transitionToRoute("orders");
    }
  }
});
