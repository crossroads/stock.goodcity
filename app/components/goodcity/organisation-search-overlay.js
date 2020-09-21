import Ember from "ember";
import _ from "lodash";
import SearchMixin from "stock/mixins/search_resource";

export default Ember.Component.extend(SearchMixin, {
  queryParams: ["redirectToPath"],
  redirectToPath: null,
  minSearchTextLength: 3,
  displayResults: false,
  store: Ember.inject.service(),

  onSearchTextChange: Ember.observer("searchText", function() {
    this.hideResults();
    if (this.get("searchText").length) {
      Ember.run.debounce(this, this.showResults, 500);
    }
  }),

  hasSearchText: Ember.computed("searchText", function() {
    return !!this.get("searchText");
  }),

  hideResults() {
    this.set("displayResults", false);
  },

  showResults() {
    this.set("displayResults", true);
  },

  actions: {
    clearSearch() {
      this.set("searchText", "");
    },

    addOrganisation() {
      this.replaceRoute("organisations.new");
    },

    cancelSearch() {
      this.set("searchText", "");
      this.set("open", false);
    },

    setOrganization(organisation) {
      const onSelect = this.getWithDefault("onSelect", _.noop);
      onSelect(organisation);

      this.set("searchText", "");
      this.set("open", false);
    },

    loadMoreOrganisations(page) {
      const params = {
        page: page,
        per_page: 25,
        searchText: this.get("searchText"),
        stockRequest: true
      };

      return this.get("store").query("gcOrganisation", params);
    }
  }
});
