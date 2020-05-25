import Ember from "ember";

export default Ember.Component.extend({
  attributeBindings: ["type", "value"],
  tagName: "input",
  type: "checkbox",
  checked: false,
  selection: [],

  didInsertElement() {
    var isCurrentRole =
      this.get("selection").indexOf(parseInt(this.get("selected"))) >= 0;
    if (isCurrentRole) {
      this.$().prop("checked", true);
      this.sendAction("action", this.get("value"), true);
    }
  },

  _updateElementValue: function() {
    this.set("checked", this.$().prop("checked"));
    var isChecked = this.get("checked");
    this.sendAction("action", this.get("value"), isChecked);
  }.on("didInsertElement"),

  change: function(event) {
    this._updateElementValue();
  }
});
