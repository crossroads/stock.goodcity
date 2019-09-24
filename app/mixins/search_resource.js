import Ember from "ember";
import _ from "lodash";

/**
 * Search mixin has utilities to implement Searching.
 * This Mixin expects boolean property `autoLoad` on the implemented controller.
 * There are two use case of this mixin:
 * a) Query on model as soon we land on the page.
 *   - declare `autoLoad: true` in the used controller
 * b) Query on model explicitly with some `searchText`.
 *   - declare `autoLoad: false` in the used controller
 **/

export default Ember.Mixin.create({
  // ----- Services -----
  filterService: Ember.inject.service(),
  utilityMethods: Ember.inject.service(),

  // ----- Arguments -----
  minSearchTextLength: 2,
  searchText: "",
  displayResults: false,

  // ----- Observers -----
  on() {
    this.showResults(); // Upon opening the page, we populate with results
    this.get("filterService").on("change", this, this.reloadResults);
  },

  off() {
    this.get("filterService").off("change", this, this.reloadResults);
  },

  onSearchTextChange: Ember.observer("searchText", function() {
    if (this.get("searchText").length > this.get("minSearchTextLength")) {
      this.rerenderOrShowNewResult();
    }
  }),

  // ----- Helpers ------

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
   * Rerequest or request new Search
   **/
  rerenderOrShowNewResult() {
    if (this.get("autoLoad")) {
      this.reloadResults();
    } else {
      this.showResults();
    }
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
      per_page: 25,
      page: pageNo
    };
  },

  /**
   * Returns searchText to be query
   **/
  getSearchQuery() {
    return {
      searchText: this.get("searchText"),
      shallow: true
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
