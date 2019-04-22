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
      Ember.run.debounce(this, this.incrementPage, 100);
    }
  },

  incrementPage() {
    let incrementPageSize = this.get("page") + 1;
    if (this.get("page") < this.get("totalPages")) {
      this.set("page", incrementPageSize);
    }
  },

  clearOldSearchedData: Ember.observer("opts", function() {
    if (this.get("opts.searchText") !== this.get("oldSearchedText")) {
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
    const model = this.get("model");
    let loadingView = getOwner(this)
      .lookup("component:loading")
      .append();

    this.get("store")
      .query(model, this.params())
      .then(data => {
        this.get("store").pushPayload(data);
        const newPageData = data.content;
        let filteredData = this.get("filteredResults");
        newPageData.forEach(data => {
          let record = this.get("store").peekRecord("designation", data.id);
          filteredData.push(record);
        });
        this.set("filteredResults", filteredData);
        this.toggleProperty("toggle");
        this.set("totalPages", data.meta.total_pages);
        this.set("oldSearchedText", data.meta.search);
      })
      .finally(() => loadingView.destroy());
  }),

  willDestroyElement() {
    Ember.$("body").unbind();
  }
});
