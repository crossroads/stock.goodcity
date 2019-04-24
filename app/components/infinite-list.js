import Ember from "ember";
const { getOwner } = Ember;

export default Ember.Component.extend({
  model: "",
  per_page: "",
  page: 1,
  toggle: false,
  filteredResults: [],
  totalPages: 1,
  oldSearchedText: "",
  opts: null,
  isLoadingMore: false,

  store: Ember.inject.service(),

  filteredContent: Ember.computed(
    "toggle",
    "filteredResults",
    "filteredResults.[]",
    function() {
      return this.get("filteredResults");
    }
  ),

  didInsertElement() {
    this._super(...arguments);
    let _this = this;
    Ember.$("body").on("scroll", function() {
      _this.detectPosition(this);
    });
  },

  detectPosition(self) {
    if (
      $(self).scrollTop() + $(self).innerHeight() >=
      $(self)[0].scrollHeight - 100
    ) {
      Ember.run.debounce(this, this.fetchRecord, 100);
    }
  },

  fetchRecord() {
    if (this.get("hasMorePages")) {
      this.get("loadMore")();
    }
  },

  willDestroyElement() {
    Ember.$(this).unbind();
  }
});
