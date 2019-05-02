import Ember from "ember";
import { STATE_FILTERS } from "../services/filter-service";

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
      if (priority) {
        stateFilter.unshift(STATE_FILTERS.PRIORITY);
      }
      filterService.clearFilters();
      filterService.set("orderStateFilters", stateFilter);
      filterService.notifyPropertyChange("orderStateFilters");
      filterService.notifyPropertyChange("orderTypeFilters");
      this.transitionToRoute("orders", { queryParams: { preload: true } });
    }
  }
});
