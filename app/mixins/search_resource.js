import Ember from "ember";
import _ from "lodash";

/**
 * Search mixin has utilities to implement Searching.
 *
 * Configuring the search(property to be declared in controller where this mixin is used):
 *  -  @property {Number} `perPage`: number of results in response.
 *  -  @property {Boolean} `autoLoad`: to query on model as soon we land on the page.

 * Requirements:
 *  - This controllers sets and unsets `displayResults`
 *  - call `on()` and `off()` from calling page route for auto initial load of the records and cleaning the record.
 *    Example:
 *     setupController() {
 *       controller.on()
 *     },
 *     resetController(controller) {
 *       controller.off()
 *     }
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
    const searchTextLength = this.get("searchText").length;
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
   **/
  reloadResults() {
    this.hideResults();
    Ember.run.debounce(this, this.showResults, 500);
  },

  /**
   * Hide existing result
   **/
  hideResults() {
    Ember.run(() => {
      this.set("displayResults", false);
    });
  },

  /**
   * Initiate fetch request
   **/
  showResults() {
    Ember.run(() => {
      this.set("displayResults", true);
    });
  },

  /**
   * Returns pagination query Object with per_page and pageNo
   * @param {pageNo} pageNo to query
   **/
  getPaginationQuery(pageNo) {
    return {
      per_page: this.get("perPage"),
      page: pageNo
    };
  },

  /**
   * Returns searchText to be query
   **/
  getSearchQuery() {
    return {
      searchText: this.get("searchText"),
      ...this.get("searchProps")
    };
  },

  /**
   * Remove undefined values from query Object
   **/
  trimQuery(query) {
    // Remove any undefined values
    return _.pickBy(query, _.identity);
  }
});
