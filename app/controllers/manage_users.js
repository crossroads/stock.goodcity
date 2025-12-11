import Ember from "ember";

export default Ember.Controller.extend({
  // Minimum length for non-Chinese/Japanese/Korean (CJK) searches
  minSearchTextLength: 3,
  displayResults: false,
  isSearchTextLongEnough(text) {
    // length >= 1 for CJK, otherwise length >= minSearchTextLength
    if (!text) return false;
    const trimmed = text.trim();
    if (!trimmed) return false;
    const length = Array.from(trimmed).length;
    const minSearchTextLength = this.get("minSearchTextLength");
    const isCJKPresent = /[\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF]/.test(
      trimmed
    );
    if (isCJKPresent) {
      return length >= 1;
    } else {
      return length >= minSearchTextLength;
    }
  },
  onSearchTextChange: Ember.observer("searchText", function() {
    this.hideResults();
    if (this.isSearchTextLongEnough(this.get("searchText"))) {
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
        stockRequest: true
      };

      return this.get("store").query("user", params);
    }
  }
});
