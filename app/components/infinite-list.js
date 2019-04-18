import Ember from "ember";

export default Ember.Component.extend({
  tagName: "div",
  partialName: "",
  store: Ember.inject.service(),
  model: "",
  per_page: "",
  searchText: "",
  page: 1,
  filteredResults: [],

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
      Ember.$("body").unbind();
      $("body").animate({ scrollTop: $(self)[0].scrollHeight - 1000 });
      Ember.run.debounce(this, this.fetchMore, 100);
    }
  },

  fetchMore() {
    let incrementPageSize = this.get("page") + 1;
    this.set("page", incrementPageSize);
  },

  fetchData: Ember.computed("searchText", "page", function() {
    if (this.get("searchText").length) {
      const ObjectPromiseProxy = Ember.ObjectProxy.extend(
        Ember.PromiseProxyMixin
      );
      const model = this.get("model");
      const per_page = this.get("per_page");

      let promise = this.get("store").query(model, {
        per_page: 12,
        page: 1,
        searchText: this.get("searchText")
      });
      let responseObject = ObjectPromiseProxy.create({ promise });
      responseObject.catch(() => {});
      return responseObject;
    }
  })

  // filteredData: Ember.observer('fetchData.content.content', function(){
  //   let data = this.get('fetchData.content.content');
  //   this.get('filteredResults').pushObject(data);
  // })
});
