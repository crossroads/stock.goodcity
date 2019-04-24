import Ember from "ember";
import searchModule from "../search_module";

export default searchModule.extend({
  searchModelName: "designation",
  unloadAll: true,
  minSearchTextLength: 2,
  queryParams: ["preload"],
  searchedText: "",
  optionalParams: null,
  fetchedData: [],
  page: 0,
  hasMorePages: true,

  filterService: Ember.inject.service(),
  utilityMethods: Ember.inject.service(),

  clearContent: Ember.observer("searchText", function() {
    if (!this.get("searchText").length) {
      this.set("fetchedData", []);
    }
  }),

  onSearchTextChange: Ember.observer("searchText", function() {
    if (this.get("searchText").length > this.get("minSearchTextLength")) {
      Ember.run.debounce(
        this,
        function() {
          this.send("loadOrders");
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
    loadOrders() {
      let incrementPageSize = this.get("page") + 1;
      this.set("page", incrementPageSize);
      this.get("store")
        .query("designation", {
          per_page: 12,
          page: incrementPageSize,
          searchText: this.get("searchText")
        })
        .then(data => {
          const newPageData = data.content;
          newPageData.forEach(data => {
            let record = this.get("store").peekRecord("designation", data.id);
            this.get("fetchedData").pushObject(record);
          });
          data.content.length
            ? this.set("hasMorePages", true)
            : this.set("hasMorePages", false);
        });
    }
  }
});
