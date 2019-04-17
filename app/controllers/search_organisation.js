import Ember from "ember";
import searchModule from "./search_module";
const { getOwner } = Ember;

export default searchModule.extend({
  minSearchTextLength: 3,
  fetchedResults: [],
  startingPage: 0,

  onSearchTextChange: Ember.observer("searchText", function() {
    if (this.get("searchText").length) {
      Ember.run.debounce(this, this.fetchRecord, 500);
    } else {
      this.set("fetchedResults", []);
    }
  }),

  fetchRecord() {
    const searchText = this.get("searchText");
    if (searchText.length > this.get("minSearchTextLength")) {
      let currentPage = this.get("startingPage") + 1;
      let loadingView = getOwner(this)
        .lookup("component:loading")
        .append();
      this.store
        .query("gcOrganisation", {
          perPage: 12,
          startingPage: currentPage,
          searchText: searchText
        })
        .then(data => {
          let updatedData = this.get("fetchedResults").pushObject(data);
          this.set("fetchedResults", updatedData);
          this.set("startingPage", currentPage);
        })
        .finally(() => loadingView.destroy());
    }
  },

  actions: {
    cancelSearch() {
      Ember.$("#searchText").blur();
      this.send("clearSearch", true);
      this.transitionToRoute("app_menu_list");
    },

    loadSearchOrganisation() {
      console.log("gcOrganisation called");
      this.fetchRecord();
    }
  }
});
