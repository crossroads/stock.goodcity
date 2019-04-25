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
      filterService.setStateTypeFilter(stateFilter);
      filterService.notifyPropertyChange("getOrderStateFilters");
      filterService.notifyPropertyChange("getOrderTypeFilters");
      this.transitionToRoute("orders");
    }
  }
});
