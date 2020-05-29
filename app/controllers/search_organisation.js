import Ember from "ember";

export default Ember.Controller.extend({
  queryParams: ["backToNewUser"],
  backToNewUser: false,
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
      if (this.get("backToNewUser")) {
        this.replaceRoute("add_user");
      } else {
        this.transitionToRoute("app_menu_list");
      }
    },

    setOrganization(organisation) {
      if (this.get("backToNewUser")) {
        this.replaceRoute("add_user", {
          queryParams: {
            organisationId: organisation.id
          }
        });
      } else {
        this.transitionToRoute("organisations.detail", organisation.id);
      }
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
