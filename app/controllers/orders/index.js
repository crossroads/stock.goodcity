import Ember from "ember";
import _ from "lodash";
import { STATE_FILTERS } from "../../services/filter-service";

export default Ember.Controller.extend({
  minSearchTextLength: 2,
  searchedText: "",
  displayResults: false,

  filterService: Ember.inject.service(),
  utilityMethods: Ember.inject.service(),

  afterSearch(designations) {
    if (designations && designations.get("length") > 0) {
      this.get("store").query("order_transport", {
        order_ids: designations.mapBy("id").join(",")
      });
    }
  },

  on() {
    this.get("filterService").on("change", this, this.onFilterChange);
  },

  off() {
    this.get("filterService").off("change", this, this.onFilterChange);
  },

  onSearchTextChange: Ember.observer("searchText", function() {
    this.hideResults();
    if (this.get("searchText").length > this.get("minSearchTextLength")) {
      Ember.run.debounce(this, this.showResults, 500);
    }
  }),

  onStartup() {
    if (this.get("filterService.hasOrderFilters")) {
      // Once performance has been improved
      // we'll probably want to always show somthing
      this.showResults();
    }
  },

  hideResults() {
    this.set("displayResults", false);
  },

  showResults() {
    this.set("displayResults", true);
  },

  getFilterQuery() {
    const filterService = this.get("filterService");
    const utils = this.get("utilityMethods");

    let { after, before } = filterService.get("orderTimeRange");
    let isPriority = filterService.isPriority();
    let typesFilters = filterService.get("orderTypeFilters");
    let stateFilters = _.without(
      filterService.get("orderStateFilters"),
      STATE_FILTERS.PRIORITY
    );

    return {
      state: utils.stringifyArray(stateFilters),
      type: utils.stringifyArray(typesFilters),
      priority: isPriority,
      after: after && after.getTime(),
      before: before && before.getTime()
    };
  },

  getSearchQuery() {
    return {
      searchText: this.get("searchText"),
      shallow: true
    };
  },

  getPaginationQuery(pageNo) {
    return {
      per_page: 25,
      page: pageNo
    };
  },

  trimQuery(query) {
    // Remove any undefined values
    return _.pickBy(query, _.identity);
  },

  actions: {
    loadMoreOrders(pageNo) {
      const params = this.trimQuery(
        _.merge(
          {},
          this.getFilterQuery(),
          this.getSearchQuery(),
          this.getPaginationQuery(pageNo)
        )
      );

      return this.get("store")
        .query("designation", params)
        .then(results => {
          this.afterSearch(results);
          return results;
        });
    }
  }
});
