import config from "../../config/environment";
import Ember from "ember";
import _ from "lodash";

export default Ember.Controller.extend({
  queryParams: ["searchInput"],
  hideDetailsLink: true,

  orderId: Ember.computed.alias("model.id"),
  isMobileApp: config.cordova.enabled,
  autoDisplayOverlay: false,
  minSearchTextLength: 2,
  searchText: "",
  displayResults: false,

  onSearchTextChange: Ember.observer("searchText", function() {
    if (this.get("searchText").length > this.get("minSearchTextLength")) {
      this.showResults();
    }
  }),

  getFilterQuery() {
    return {
      stockRequest: true,
      restrictMultiQuantity: true
    };
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

  triggerDisplayDesignateOverlay() {
    this.set("autoDisplayOverlay", true);
  },

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
    },

    displaySetItems(item) {
      this.set("itemSetId", item.get("itemId"));
      Ember.run.debounce(this, this.applyFilter, 0);
    }
  }
});
