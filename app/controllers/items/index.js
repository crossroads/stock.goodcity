import config from "../../config/environment";
import _ from "lodash";
import SearchMixin from "stock/mixins/search_resource";

/**
 * @module Controllers/items/ItemsSearchController
 * @augments ember/Controller
 */
export default Ember.Controller.extend(SearchMixin, {
  queryParams: ["searchInput", "itemSetId"],
  itemSetId: null,
  isMobileApp: config.cordova.enabled,
  displayItemOptionsList: true,
  searchModelName: "item",
  requestOptions: {
    withInventoryNumber: "true"
  },

  /**
   * @property {Boolean} SearchMixin configuration
   **/
  autoLoad: true,
  /**
   * @property {Number} SearchMixin configuration, perPage in response
   **/
  perPage: 25,

  scannedItem: Ember.observer("searchInput", function() {
    const searchInput = this.get("searchInput") || "";
    const sanitizeString = this.sanitizeString(searchInput);
    if (sanitizeString) {
      this.set("searchText", sanitizeString);
    }
  }),

  scannedText: Ember.observer("searchText", function() {
    const searchInput = this.get("searchText") || "";
    const sanitizeString = this.sanitizeString(searchInput);
    //if (sanitizeString) {
    this.set("searchInput", sanitizeString);
    //}
  }),

  hasSearchText: Ember.computed("searchText", function() {
    return Ember.$.trim(this.get("searchText")).length;
  }),

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
      this.reloadResults();
    }
  }),

  actions: {
    /**
     * Load the next page of the list
     *
     * @param {number} pageNo the page to load
     * @returns {Promise<Model[]>}
     */
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
    clearSearch() {
      this.set("searchText", "");
    }
  }
});
