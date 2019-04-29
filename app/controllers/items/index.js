import config from "../../config/environment";
import Ember from "ember";
import searchModule from "../search_module";

export default searchModule.extend({
  queryParams: ["searchInput", "itemSetId", "locationFilterChanged"],
  searchInput: "",
  itemSetId: null,
  locationFilterChanged: null,
  isMobileApp: config.cordova.enabled,
  displayItemOptions: false,
  displayItemOptionsList: true,
  searchModelName: "item",
  minSearchTextLength: 2,
  requestOptions: {
    withInventoryNumber: "true"
  },

  on() {
    this.get("filterService").on("change", this, this.onFilterChange);
  },

  off() {
    this.get("filterService").off("change", this, this.onFilterChange);
  },

  createFilterParams() {
    let filterService = this.get("filterService");
    let utilities = this.get("utilityMethods");
    let itemStateFilters = filterService.get("itemStateFilters");
    let itemlocationFilter = filterService.get("itemLocationFilters");
    return {
      perPage: 25,
      startingPage: 1,
      modelPath: "filteredResults",
      stockRequest: true,
      state: utilities.stringifyArray(itemStateFilters) || "received",
      location: itemlocationFilter
    };
  },

  applyFilter(opts = {}) {
    const { force = false } = opts;
    var searchText = this.get("searchText");
    let UNLOAD_MODELS = ["designation", "item", "location", "code"];

    if (force || searchText.length) {
      this.set("isLoading", true);
      this.set("hasNoResults", false);
      if (this.get("unloadAll")) {
        UNLOAD_MODELS.forEach(model => this.store.unloadAll(model));
      }
      this.infinityModel(
        this.get("searchModelName"),
        this.createFilterParams(),
        this.buildQueryParamMap()
      )
        .then(data => {
          if (force || this.get("searchText") === data.meta.search) {
            this.set("filteredResults", data);
            this.set("hasNoResults", data.get("length") === 0);
          }
        })
        .finally(() => this.set("isLoading", false));
    }
    this.set("filteredResults", []);
  },

  onItemSetIdChange: Ember.observer("itemSetId", function() {
    // wait before applying the filter
    if (this.get("itemSetId")) {
      Ember.run.debounce(this, this.applyFilter, 0);
    }
  })
});
