import Ember from "ember";

export default Ember.Component.extend({
  intl: Ember.inject.service(),
  filterService: Ember.inject.service(),

  orderStateFilters: Ember.computed.alias("filterService.orderStateFilters"),
  hasStateFilters: Ember.computed("orderStateFilters", function() {
    return this.get("orderStateFilters").length > 0;
  }),

  orderTypeFilters: Ember.computed.alias("filterService.orderTypeFilters"),
  hasTypeFilters: Ember.computed("orderTypeFilters", function() {
    return this.get("orderTypeFilters").length > 0;
  }),

  orderTimeRange: Ember.computed.alias("filterService.orderTimeRange"),
  hasTimeFilters: Ember.computed("orderTimeRange", function() {
    const { preset, after, before } = this.get("orderTimeRange");
    return preset || after || before;
  }),

  actions: {
    redirectTofilters(queryParam) {
      const orderFilter = {};
      orderFilter[queryParam] = true;
      this.get("router").transitionTo("order_filters", {
        queryParams: orderFilter
      });
    },

    clearStateFilters() {
      this.get("filterService").clearOrderStateFilters();
    },

    clearTypeFilters() {
      this.get("filterService").clearOrderTypeFilters();
    },

    clearTimeFilters() {
      this.get("filterService").clearOrderTimeFilters();
    }
  }
});
