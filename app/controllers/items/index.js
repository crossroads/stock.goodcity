import config from "../../config/environment";
import Ember from "ember";
import _ from "lodash";

export default Ember.Controller.extend({
  queryParams: ["searchInput", "itemSetId", "locationFilterChanged"],
  itemSetId: null,
  locationFilterChanged: null,
  isMobileApp: config.cordova.enabled,
  displayItemOptions: false,
  displayItemOptionsList: true,
  searchModelName: "item",
  minSearchTextLength: 2,
  searchedText: "",
  filterService: Ember.inject.service(),
  utilityMethods: Ember.inject.service(),
  requestOptions: {
    withInventoryNumber: "true"
  },

  displayResults: false,

  on() {
    this.showResults(); // Upon opening the page, we populate with results
    this.get("filterService").on("change", this, this.reloadResults);
  },

  off() {
    this.get("filterService").off("change", this, this.reloadResults);
  },

  onSearchTextChange: Ember.observer("searchText", function() {
    if (this.get("searchText").length > this.get("minSearchTextLength")) {
      this.reloadResults();
    }
  }),

  reloadResults() {
    this.hideResults();
    Ember.run.debounce(this, this.showResults, 500);
  },

  hideResults() {
    Ember.run(() => {
      this.set("displayResults", false);
    });
  },

  showResults() {
    Ember.run(() => {
      this.set("displayResults", true);
    });
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

  getFilterQuery() {
    let filterService = this.get("filterService");
    let utilities = this.get("utilityMethods");
    let itemStateFilters = filterService.get("itemStateFilters");
    let itemlocationFilter = filterService.get("itemLocationFilters");
    return {
      stockRequest: true,
      state: utilities.stringifyArray(itemStateFilters) || "received",
      location: itemlocationFilter
    };
  },

  onItemSetIdChange: Ember.observer("itemSetId", function() {
    // wait before applying the filter
    if (this.get("itemSetId")) {
      Ember.run.debounce(this, this.applyFilter, 0);
    }
  }),

  actions: {
    loadMoreItems(pageNo) {
      const params = this.trimQuery(
        _.merge(
          {},
          this.getFilterQuery(),
          this.getSearchQuery(),
          this.getPaginationQuery(pageNo)
        )
      );

      return this.get("store")
        .query("item", params)
        .then(results => {
          return results;
        });
    }
  }
});
