import Ember from "ember";
import _ from "lodash";

export default Ember.Component.extend({
  i18n: Ember.inject.service(),
  filterService: Ember.inject.service(),

  itemStateFilters: Ember.computed.alias("filterService.itemStateFilters"),
  hasStateFilters: Ember.computed("appliedFilters", function() {
    return this.get("appliedFilters").length > 0;
  }),

  appliedFilters: Ember.computed("itemStateFilters", function() {
    let filters = [];
    const itemFilters = this.get("itemStateFilters");
    const arrayFilters = _.map(itemFilters, function(filter) {
      if (_.isArray(filter)) {
        filter.forEach(state => {
          if (state.enabled) {
            filters.push(state.state);
          }
        });
      } else if (filter) {
        filters.push(filter);
      }
    });
    return filters;
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
