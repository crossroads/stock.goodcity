import Ember from "ember";
import searchModule from "../search_module";

export default searchModule.extend({
  searchModelName: "designation",
  unloadAll: true,
  minSearchTextLength: 2,
  queryParams: ["preload"],
  searchedText: "",
  optionalParams: null,

  filterService: Ember.inject.service(),
  utilityMethods: Ember.inject.service(),

  onSearchTextChange: Ember.observer("searchText", function() {
    if (this.get("searchText").length) {
      Ember.run.debounce(this, this.fetchRecord, 500);
    }
  }),

  fetchRecord() {
    const filterService = this.get("filterService");
    const typesFilter = filterService.get("getOrderTypeFilters");
    const utilities = this.get("utilityMethods");
    const isPriority = filterService.isPriority();
    let filter = filterService.get("getOrderStateFilters");

    if (isPriority) {
      filter.shift();
    }
    const searchText = this.get("searchText");

    let params = {
      state: utilities.stringifyArray(filter),
      type: utilities.stringifyArray(typesFilter),
      priority: isPriority,
      searchText: searchText
    };
    this.set("optionalParams", params);
  },

  onItemLoaded(record) {
    const orgId = Ember.get(record, "gcOrganisationId");
    if (orgId) {
      this.store.findRecord("gc_organisation", orgId, { reload: false });
    }
  }
});
