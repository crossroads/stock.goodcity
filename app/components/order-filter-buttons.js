import { computed } from "@ember/object";
import { alias } from "@ember/object/computed";
import { inject as service } from "@ember/service";
import Component from "@ember/component";

export default Component.extend({
  i18n: service(),
  filterService: service(),

  orderStateFilters: alias("filterService.orderStateFilters"),
  hasStateFilters: computed("orderStateFilters", function() {
    return this.get("orderStateFilters").length > 0;
  }),

  orderTypeFilters: alias("filterService.orderTypeFilters"),
  hasTypeFilters: computed("orderTypeFilters", function() {
    return this.get("orderTypeFilters").length > 0;
  }),

  orderTimeRange: alias("filterService.orderTimeRange"),
  hasTimeFilters: computed("orderTimeRange", function() {
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
