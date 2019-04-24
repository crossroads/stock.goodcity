import Ember from "ember";
const { getOwner } = Ember;

export default Ember.Component.extend({
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
