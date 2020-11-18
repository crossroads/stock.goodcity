import Ember from "ember";

export default Ember.Component.extend({
  displayDropDownItems: false,

  actions: {
    toggleDisplayItems() {
      this.toggleProperty("displayDropDownItems");
    },

    selectOption(item) {
      this.get("setSelectedValue")(item);
      this.set("displayDropDownItems", false);
    },

    closeDropDown() {
      this.set("displayDropDownItems", false);
    }
  }
});
