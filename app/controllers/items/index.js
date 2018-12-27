import config from '../../config/environment';
import Ember from "ember";
import searchModule from "../search_module";

export default searchModule.extend({

  queryParams: ['searchInput', "itemSetId", "isFiltered"],
  searchInput: "",
  itemSetId: null,

  isMobileApp: config.cordova.enabled,
  displayItemOptions: false,
  displayItemOptionsList: true,
  searchModelName: "item",
  minSearchTextLength: 2,
  requestOptions: {
    withInventoryNumber: 'true'
  },

  applyFilter() {
    var searchText = this.get("searchText");
    let filterService = this.get('filterService');
    let utilities = this.get("utilityMethods");
    let UNLOAD_MODELS = [ "designation", "item", "location", "code"];

    if (searchText.length > 0) {
      this.set("isLoading", true);
      this.set("hasNoResults", false);
      if(this.get("unloadAll")) {  UNLOAD_MODELS.forEach((model) => this.store.unloadAll(model)); }

      let itemStateFilters = filterService.get('getItemStateFilters');
      let locationFilter = filterService.get('getItemLocationFilters');
      const paginationOpts = {
        perPage: 25,
        startingPage: 1,
        modelPath: 'filteredResults',
        stockRequest: true,
        state: utilities.stringifyArray(itemStateFilters) || "received",
        location: locationFilter
      };
      this.infinityModel(this.get("searchModelName"),
        paginationOpts,
        this.buildQueryParamMap()
      ).then(data => {
        data.forEach(record => {
          if (this.onItemLoaded) {
            this.onItemLoaded(record);
          }
        });
        if(this.get("searchText") === data.meta.search) {
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
