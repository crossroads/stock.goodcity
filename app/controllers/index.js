import Ember from "ember";

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
        stateFilter.unshift("showPriority");
      }
      filterService.clearFilters();
      filterService.set("orderStateFilters", stateFilter);
      filterService.notifyPropertyChange("orderStateFilters");
      filterService.notifyPropertyChange("orderTypeFilters");
      this.transitionToRoute("orders", { queryParams: { preload: true } });
    }
  }
});
