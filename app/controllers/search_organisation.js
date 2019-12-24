import $ from "jquery";
import { debounce } from "@ember/runloop";
import { observer } from "@ember/object";
import searchModule from "./search_module";

export default searchModule.extend({
  minSearchTextLength: 3,
  displayResults: false,

  onSearchTextChange: observer("searchText", function() {
    this.hideResults();
    if (this.get("searchText").length) {
      debounce(this, this.showResults, 500);
    }
  }),

  hideResults() {
    this.set("displayResults", false);
  },

  showResults() {
    this.set("displayResults", true);
  },

  actions: {
    cancelSearch() {
      $("#searchText").blur();
      this.send("clearSearch", true);
      this.transitionToRoute("app_menu_list");
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
