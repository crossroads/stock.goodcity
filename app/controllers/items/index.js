import config from "../../config/environment";
import _ from "lodash";
import Cache from "stock/utils/mem-cache";
import SearchMixin from "stock/mixins/search_resource";

/**
 * @module Controllers/items/ItemsSearchController
 * @augments ember/Controller
 */
export default Ember.Controller.extend(SearchMixin, {
  session: Ember.inject.service(),
  queryParams: ["searchInput", "itemSetId"],
  itemSetId: null,
  isMobileApp: config.cordova.enabled,
  displayItemOptionsList: true,
  searchModelName: "item",
  requestOptions: {
    withInventoryNumber: "true"
  },

  packageService: Ember.inject.service(),
  packageTypeService: Ember.inject.service(),

  init() {
    this._super(...arguments);
    this.cache = new Cache();
    this.get("session").memCache.push(this.cache);
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
    this.set("searchInput", this.sanitizeString(searchInput));
  }),

  hasSearchText: Ember.computed("searchText", function() {
    return Ember.$.trim(this.get("searchText")).length;
  }),

  reloadResults() {
    this.get("cache").clear();
    this._super();
  },

  createCacheKey(data) {
    return JSON.stringify(data);
  },

  getFilterQuery() {
    let filterService = this.get("filterService");
    let utilities = this.get("utilityMethods");
    let itemStateFilters = filterService.get("itemStateFilterArray");
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
      const cache = this.get("cache");
      const params = this.trimQuery(
        _.merge(
          {},
          this.getFilterQuery(),
          this.getSearchQuery(),
          this.getPaginationQuery(pageNo)
        )
      );
      const cacheKey = this.createCacheKey(params);
      if (cache.has(cacheKey)) {
        return cache.get(cacheKey);
      }
      return this.get("store")
        .query("item", params)
        .then(results => {
          cache.set(cacheKey, results);
          return results;
        });
    },

    async createNewPackage() {
      const type = await this.get("packageTypeService").userPickPackageType();
      if (type) {
        this.transitionToRoute("items.new", {
          queryParams: { codeId: type.id }
        });
      }
    },

    clearSearch() {
      this.set("searchText", "");
    }
  }
});
