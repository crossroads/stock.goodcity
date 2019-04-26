import Ember from "ember";
import _ from "lodash";
import searchModule from "../search_module";
import { STATE_FILTERS } from "../../services/filter-service";

export default searchModule.extend({
  searchModelName: "designation",
  minSearchTextLength: 2,
  queryParams: ["preload"],
  modelPath: "filteredResults",
  unloadAll: false,
  searchedText: "",
  displayResults: false,

  filterService: Ember.inject.service(),
  utilityMethods: Ember.inject.service(),

  afterSearch(designations) {
    this.get("store").query("order_transport", {
      order_ids: designations.mapBy("id").join(",")
    });
  },

  onSearchTextChange: Ember.observer("searchText", function() {
    this.set("displayResults", false);
    if (this.get("searchText").length > this.get("minSearchTextLength")) {
      Ember.run.debounce(
        this,
        function() {
          this.set("displayResults", true);
        },
        500
      );
    }
  }),

  onStartup() {
    const hasFiltersSet =
      this.get("filterService.orderStateFilters").length > 0 ||
      this.get("filterService.orderTypeFilters").length > 0;

    if (hasFiltersSet) {
      this.set("displayResults", true);
    }
  },

  createFilterParams() {
    let utilities = this.get("utilityMethods");
    let filterService = this.get("filterService");
    let stateFilters = filterService.get("orderStateFilters");
    let isPriority = filterService.isPriority();
    if (isPriority) {
      stateFilters = _.without(stateFilters, STATE_FILTERS.PRIORITY);
    }
    let typesFilters = filterService.get("orderTypeFilters");
    let { after, before } = filterService.get("orderTimeRange");
    let params = _.extend({}, this._super(), {
      state: utilities.stringifyArray(stateFilters),
      type: utilities.stringifyArray(typesFilters),
      priority: isPriority
    });

    if (after) {
      params.after = after.getTime();
    }
    if (before) {
      params.before = before.getTime();
    }
    return params;
  },

  actions: {
    loadMoreOrders(pageNo) {
      const utils = this.get("utilityMethods");
      const filterService = this.get("filterService");

      let filter = filterService.get("getOrderStateFilters");
      let typeFilter = filterService.get("getOrderTypeFilters");
      let isPriority = filterService.isPriority();
      if (isPriority) {
        filter = _.without(filter, "showPriority");
      }

      return this.get("store").query("designation", {
        state: utils.stringifyArray(filter),
        type: utils.stringifyArray(typeFilter),
        priority: isPriority,
        per_page: 25,
        page: pageNo,
        searchText: this.get("searchText")
      });
    }
  }
});
