import Ember from "ember";
import _ from "lodash";

export default Ember.Component.extend({
  intl: Ember.inject.service(),
  filterService: Ember.inject.service(),

  itemStateFilters: Ember.computed.alias("filterService.itemStateFilters"),
  hasStateFilters: Ember.computed("itemStateFilters", function() {
    return this.get("itemStateFilters").length > 0;
  }),

  itemLocationFilters: Ember.computed.alias(
    "filterService.itemLocationFilters"
  ),
  hasLocationFilters: Ember.computed("itemLocationFilters", function() {
    return !!this.get("itemLocationFilters");
  }),

  actions: {
    redirectTofilters(param) {
      const queryParams = { [param]: true };
      this.get("router").transitionTo("item_filters", { queryParams });
    },

    clearStateFilters() {
      this.get("filterService").clearItemStateFilters();
    },

    clearLocationFilters() {
      this.get("filterService").clearItemLocationFilters();
    }
  }
});
