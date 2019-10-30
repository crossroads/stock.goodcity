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
    if (this.get("searchText").length > this.get("minSearchTextLength")) {
      this.rerenderOrShowNewResult();
    }
  }),

  fetchPackageDetails: Ember.computed("packageDetails", function() {
    if (this.get("showAdditionalFields")) {
      let package_details = this.get("packageDetails");
      if (package_details) {
        let subFormData = {};
        let columns = Object.keys(package_details.get("firstObject").toJSON());
        columns.map(column => {
          let columnData = [];
          columnData = this.get("insertFixedOption").fixedOptionDropDown(
            column,
            package_details
          );
          subFormData[column] = columnData.map((_column, index) => {
            return {
              id: index + 1,
              tag: columnData[index]
            };
          });
        });
        return subFormData;
      }
    }
  }),

  onSearchCountry(searchText) {
    let searchTextLength = Ember.$.trim(searchText).length;
    if (searchTextLength) {
      this.set("searchText", searchText);
      Ember.run.debounce(this, this.applyFilter, 500);
    }
  },

  applyFilter: function() {
    let searchText = this.get("searchText");
    this.get("store")
      .query("country", {
        searchText
      })
      .then(countries => {
        //Check the input has changed since the promise started
        if (searchText === this.get("searchText")) {
          this.set("countryArray", Ember.A(countries));
        }
      });
  },

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
