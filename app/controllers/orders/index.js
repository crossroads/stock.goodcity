import Ember from "ember";
import _ from "lodash";
import searchModule from "../search_module";

export default searchModule.extend({
  searchModelName: "designation",
  filterService: Ember.inject.service(),
  utilityMethods: Ember.inject.service(),
  unloadAll: true,
  minSearchTextLength: 2,
  queryParams: ["preload"],
  searchedText: "",
  optionalParams: null,
  fetchedData: [],
  page: 0,
  hasMorePages: true,
  displayResults: false,

  filterService: Ember.inject.service(),
  utilityMethods: Ember.inject.service(),

  clearContent: Ember.observer("searchText", function() {
    if (!this.get("searchText").length) {
      this.set("fetchedData", []);
    }
  }),

  onStartup() {
    const hasFiltersSet =
      this.get("filterService.getOrderStateFilters").length > 0 ||
      this.get("filterService.getOrderTypeFilters").length > 0;

    if (hasFiltersSet) {
      this.set("displayResults", true);
    }
  },

  onSearchTextChange: Ember.observer("searchText", function() {
    this.set("displayResults", false);
    if (this.get("searchText").length > this.get("minSearchTextLength")) {
      Ember.run.debounce(
        this,
        function() {
          this.set("displayResults", true);
        },
        500
      );
    }
  }),

  onItemLoaded(record) {
    const orgId = Ember.get(record, "gcOrganisationId");
    if (orgId) {
      this.store.findRecord("gc_organisation", orgId, { reload: false });
    }
  },

  actions: {
    loadMoreOrders(pageNo) {
      const utils = this.get("utilityMethods");
      const filterService = this.get("filterService");

      let filter = filterService.get("getOrderStateFilters");
      let typeFilter = filterService.get("getOrderTypeFilters");
      let isPriority = filterService.isPriority();
      if (isPriority) {
        filter = _.without(filter, "showPriority");
      }

      return this.get("store").query("designation", {
        state: utils.stringifyArray(filter),
        type: utils.stringifyArray(typeFilter),
        priority: isPriority,
        per_page: 12,
        page: pageNo,
        searchText: this.get("searchText")
      });
    }

    // loadOrders() {
    //   const utils = this.get("utilityMethods");
    //   const filterService = this.get("filterService");

    //   let filter = filterService.get("getOrderStateFilters");
    //   let typeFilter = filterService.get("getOrderTypeFilters");
    //   let isPriority = filterService.isPriority();
    //   if (isPriority) {
    //     filter.shift();
    //   }

    //   let incrementPageSize = this.get("page") + 1;
    //   this.set("page", incrementPageSize);
    //   this.set("isLoadingMore", true);
    //   this.get("store")
    //     .query("designation", {
    //       state: utils.stringifyArray(filter),
    //       type: utils.stringifyArray(typeFilter),
    //       priority: isPriority,
    //       per_page: 12,
    //       page: incrementPageSize,
    //       searchText: this.get("searchText")
    //     })
    //     .then(data => {
    //       const newPageData = data.content;
    //       newPageData.forEach(data => {
    //         let record = this.get("store").peekRecord("designation", data.id);
    //         this.get("fetchedData").pushObject(record);
    //       });
    //       data.content.length
    //         ? this.set("hasMorePages", true)
    //         : this.set("hasMorePages", false);
    //     })
    //     .finally(() => this.set("isLoadingMore", false));
    // }
  }
});
