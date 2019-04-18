import Ember from "ember";
import searchModule from "./search_module";
const { getOwner } = Ember;

export default searchModule.extend({
  minSearchTextLength: 3,
  fetchedResults: [],
  startingPage: 0,
  searchedText: "",

  onSearchTextChange: Ember.observer("searchText", function() {
    if (this.get("searchText").length) {
      Ember.run.debounce(this, this.fetchRecord, 500);
    } else {
      this.set("fetchedResults", []);
    }
  }),

  fetchRecord() {
    const searchText = this.get("searchText");
    this.set("searchedText", searchText);
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
