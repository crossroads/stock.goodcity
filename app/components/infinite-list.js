import Ember from "ember";
const { getOwner } = Ember;

export default Ember.Component.extend({
  tagName: "div",
  partialName: "",
  store: Ember.inject.service(),
  model: "",
  per_page: "",
  searchText: "",
  page: 1,
  toggle: false,
  filteredResults: [],
  totalPages: 1,

  allData: Ember.computed(
    "toggle",
    "filteredResults",
    "filteredResults.[]",
    function() {
      return this.get("filteredResults");
    }
  ),

  didRender() {
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
      Ember.run.debounce(this, this.incrementPage, 100);
    }
  },

  incrementPage() {
    let incrementPageSize = this.get("page") + 1;
    if (this.get("page") < this.get("totalPages")) {
      this.set("page", incrementPageSize);
    }
  },

  fetchData: Ember.observer("searchText", "page", function() {
    if (this.get("searchText").length) {
      const model = this.get("model");
      const per_page = this.get("per_page");

      let loadingView = getOwner(this)
        .lookup("component:loading")
        .append();
      this.get("store")
        .query(model, {
          per_page: 12,
          page: this.get("page"),
          searchText: this.get("searchText")
        })
        .then(data => {
          const newPageData = data.content;
          let filteredData = this.get("filteredResults");
          newPageData.forEach(data => filteredData.push(data));
          this.set("filteredResults", filteredData);
          this.toggleProperty("toggle");
          this.set("totalPages", data.meta.total_pages);
        })
        .finally(() => loadingView.destroy());
    }
  })
});
