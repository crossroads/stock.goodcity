import Ember from "ember";

export default Ember.Component.extend({
  attributeBindings: ["type", "value"],
  tagName: "input",
  type: "checkbox",
  checked: false,
  selection: [],

  didInsertElement() {
    let isSelected =
      this.get("selection").indexOf(parseInt(this.get("selected"))) >= 0;
    if (isSelected) {
      this.$().prop("checked", true);
      this.sendAction("action", this.get("value"), true);
    }
  },

  _updateElementValue: function() {
    this.set("checked", this.$().prop("checked"));
    let isChecked = this.get("checked");
    this.sendAction("action", this.get("value"), isChecked);
  }.on("didInsertElement"),

  change: function(event) {
    this._updateElementValue();
  }
});
