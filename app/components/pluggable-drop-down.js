import Ember from "ember";

export default Ember.Component.extend({
  displayDropDownItems: false,

  actions: {
    toggleDisplayItems() {
      this.toggleProperty("displayDropDownItems");
    }
  }
});
