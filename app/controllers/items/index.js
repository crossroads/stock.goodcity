import config from "../../config/environment";
import _ from "lodash";
import SearchMixin from "../../mixins/search_resource";

export default Ember.Controller.extend(SearchMixin, {
  queryParams: ["searchInput", "itemSetId"],
  itemSetId: null,
  isMobileApp: config.cordova.enabled,
  displayItemOptions: false,
  displayItemOptionsList: true,
  searchModelName: "item",
  requestOptions: {
    withInventoryNumber: "true"
  },

  /**
   * @type {Boolean}, expected in SearchMixin
   **/
  autoLoad: true,

  scannedItem: Ember.observer("searchInput", function() {
    const searchInput = this.get("searchInput") || "";
    const sanitizeString = this.sanitizeString(searchInput);
    if (sanitizeString) {
      this.set("searchText", sanitizeString);
    }
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
