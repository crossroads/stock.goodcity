import Ember from "ember";

export default Ember.Controller.extend({
  minSearchTextLength: 3,
  displayResults: false,

  onSearchTextChange: Ember.observer("searchText", function() {
    this.hideResults();
    if (this.get("searchText").length) {
      Ember.run.debounce(this, this.showResults, 500);
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
      Ember.$("#searchText").blur();
      this.set("searchText", "");
      this.transitionToRoute("app_menu_list");
    },

    loadMoreUsers(page) {
      const params = {
        page: page,
        per_page: 25,
        searchText: this.get("searchText"),
        stockRequest: true,
        roles: [
          "Charity",
          "Supervisor",
          "Reviewer",
          "Order fulfilment",
          "Order administrator"
        ]
      };

      if (this.get("searchText").trim().length >= 3) {
        return this.get("store").query("user", params);
      }
    }
  }
});
