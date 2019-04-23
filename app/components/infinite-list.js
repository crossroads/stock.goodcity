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
  hasMorePages: true,

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
    //this.incrementPage();
  },

  detectPosition(self) {
    if (
      $(self).scrollTop() + $(self).innerHeight() >=
      $(self)[0].scrollHeight - 100
    ) {
      Ember.run.debounce(this, this.incrementPage, 100);
    }
  },

  incrementPage() {
    let incrementPageSize = this.get("page") + 1;
    if (this.get("hasMorePages")) {
      this.set("page", incrementPageSize);
    }
  },

  clearOldSearchedData: Ember.observer("opts", function() {
    if (
      this.get("opts.searchText") !== this.get("oldSearchedText") ||
      !this.get("opts.searchText").length
    ) {
      this.set("filteredResults", []);
    }
  }),

  params() {
    const per_page = this.get("per_page");
    let defaultObject = {
      per_page: this.get("per_page") || 25,
      page: this.get("page")
    };
    return Object.assign(defaultObject, this.get("opts"));
  },

  fetchData: Ember.observer("opts", "page", function() {
    if (this.get("opts.searchText")) {
      const model = this.get("model");
      this.set("isLoadingMore", true);
      this.get("store")
        .query(model, this.params())
        .then(data => {
          data.content.length
            ? this.set("hasMorePages", true)
            : this.set("hasMorePages", false);
          const newPageData = data.content;
          let filteredData = this.get("filteredResults");
          newPageData.forEach(data => {
            let record = this.get("store").peekRecord("designation", data.id);
            filteredData.push(record);
          });
          this.set("filteredResults", filteredData);
          this.toggleProperty("toggle");
          this.set("oldSearchedText", data.meta.search);
        })
        .finally(() => this.set("isLoadingMore", false));
    }
  }),

  willDestroyElement() {
    Ember.$(this).unbind();
  }
});
