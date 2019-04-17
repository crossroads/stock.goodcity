import Ember from "ember";

export default Ember.Component.extend({
  tagName: "div",

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
    this.get("loadMore")();
  }
});
