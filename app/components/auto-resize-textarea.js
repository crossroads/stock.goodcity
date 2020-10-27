import Ember from "ember";

export default Ember.TextArea.extend({
  tagName: "textarea",

  attributeBindings: [
    "data-autoresize",
    "value",
    "name",
    "id",
    "placeholder",
    "maxlength",
    "required",
    "pattern"
  ],

  valueChanged: Ember.observer("value", function() {
    this.setTextareaHeight();
  }),

  didInsertElement() {
    this.setTextareaHeight();
  },

  setTextareaHeight: function() {
    if (!this.get("data-autoresize")) return;

    var textarea = this.element;
    var offset = textarea.offsetHeight - textarea.clientHeight;

    if (this.get("value") && this.get("value").length === 0) {
      Ember.$(textarea).css("height", "auto");
    } else if (textarea.scrollHeight < 120) {
      Ember.$(textarea)
        .css("height", "auto")
        .css("height", textarea.scrollHeight + offset)
        .removeAttr("data-autoresize");
    } else {
      Ember.$(textarea)
        .css({ height: "auto", "overflow-y": "auto" })
        .height(105);
    }
  },

  callAction(action, data = null) {
    if (typeof action === "function") {
      return action(data);
    } else if (typeof action === "string") {
      this.sendAction(action, data);
    }
  },

  input() {
    this.callAction(this.get("changeAction"));
  },

  click() {
    this.callAction(this.get("clickAction"));
  },

  focusOut() {
    setTimeout(() => this.callAction(this.get("onFocusOut")), 150);
  },

  focusIn() {
    this.callAction(this.get("onFocusIn"));
  }
});
