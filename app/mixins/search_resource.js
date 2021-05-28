import Ember from "ember";
import _ from "lodash";

/**
 * SearchMixin
 *
 * @mixin SearchMixin
 * @property {Number} `perPage`: number of results in response. <br>
 * @property {Boolean} `autoLoad`: to query on model as soon we land on the page
 * @description utilities to implement searching
 *
 * <br> Requirements:
 * <br>  - This controllers sets and unsets `displayResults`
 * <br>  - call `on()` and `off()` from calling page route for auto initial load of the records and cleaning the record.
 * <br>    Example:
 * <br>     setupController() { controller.on() },
 * <br>     resetController(controller) { controller.off() }
 **/
export default Ember.Mixin.create({
  // ----- Services -----
  filterService: Ember.inject.service(),
  utilityMethods: Ember.inject.service(),

  // ----- Arguments -----
  minSearchTextLength: 2,
  searchText: "",
  displayResults: false,
  countryArray: [],
  searchProps: {
    shallow: true
  },

  // ----- Observers -----
  on() {
    this.showResults(); // Upon opening the page, we populate with results
    this.get("filterService").on("change", this, this.reloadResults);
  },

  off() {
    this.get("filterService").off("change", this, this.reloadResults);
  },

  onSearchTextChange: Ember.observer("searchText", function() {
    if (this.isValidTextLength()) {
      this.reloadResults();
    }
  }),

  // ----- Helpers ------
  isValidTextLength() {
    const searchTextLength = (this.get("searchText") || "").length;
    return (
      searchTextLength > this.get("minSearchTextLength") ||
      searchTextLength === 0
    );
  },

  sanitizeString(str) {
    // these are the special characters '.,)(@_-' that are allowed for search
    // '\.' => will allow '.'
    // '\(' => will allow '('
    // '\@' => will allow '@'
    // '\)' => will allow ')'
    str = str.replace(/[^a-z0-9áéíóúñü \.,\)\(@_-]/gim, "");
    return str.trim();
  },

  /**
   * Hide existing result and make request
   *
   * @instance
   * @memberof SearchMixin
   **/
  reloadResults() {
    this.hideResults();
    Ember.run.debounce(this, this.showResults, 500);
  },

  /**
   * Hide existing results
   *
   * @instance
   * @memberof SearchMixin
   **/
  hideResults() {
    Ember.run(() => {
      this.set("displayResults", false);
    });
  },

  /**
   * Triggers the initial fetch request and shows the results
   *
   * @instance
   * @memberof SearchMixin
   **/
  showResults() {
    Ember.run(() => {
      this.set("displayResults", true);
    });
  },

  /**
   * Returns pagination query Object with per_page and pageNo
   *
   * @instance
   * @memberof SearchMixin
   * @param {pageNo} pageNo to query
   * @returns {object} the pagination query parameters
   **/
  getPaginationQuery(pageNo) {
    return {
      per_page: this.get("perPage"),
      page: pageNo
    };
  },

  /**
   * Returns searchText to be query
   *
   * @instance
   * @memberof SearchMixin
   * @returns {object} the search parameters
   **/
  getSearchQuery() {
    return {
      searchText: this.get("searchText"),
      ...this.get("searchProps")
    };
  },

  /**
   * Remove undefined values from query Object
   *
   * @instance
   * @memberof SearchMixin
   * @param {object} query the query object
   * @returns {object} the trimmed object
   **/
  trimQuery(query) {
    // Remove any undefined values
    return _.pickBy(query, _.identity);
  }
});
