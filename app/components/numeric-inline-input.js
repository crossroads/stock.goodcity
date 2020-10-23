import Ember from "ember";
import AjaxPromise from "stock/utils/ajax-promise";
import { regex } from "stock/constants/regex";
const { getOwner } = Ember;

export default Ember.TextField.extend({
  store: Ember.inject.service(),
  previousValue: "",
  tagName: "input",
  type: "text",
  attributeBindings: [
    "name",
    "type",
    "disabled",
    "value",
    "maxlength",
    "id",
    "autoFocus",
    "placeholder",
    "required",
    "pattern"
  ],
  classNameBindings: ["class"],

  didInsertElement() {
    if (this.attrs.autoFocus) {
      this.$().focus();
    }
  },

  whichKey(e, key) {
    var keyList = [13, 8, 9, 39, 46];
    return (
      (e.ctrlKey && key === 86) ||
      keyList.indexOf(key) >= 0 ||
      (key >= 35 && key <= 37) ||
      (this.get("acceptFloat") && key === 190) ||
      (key >= 48 && key <= 57) ||
      (key >= 96 && key <= 105)
    );
  },

  keyDown: function(e) {
    var key = e.charCode || e.keyCode || 0;
    this.set("currentKey", key);

    // allow ctrl+v, enter, backspace, tab, delete, numbers, keypad numbers
    // home, end only.
    var keyPressed = this.whichKey(e, key);
    return keyPressed;
  },

  focusOut() {
    this.onFocusOut && setTimeout(() => this.onFocusOut(), 150);
    Ember.$(this.element).removeClass("numeric-inline-input");
    let val = this.get("value");
    const [regexPattern, replacePattern] = this.get("acceptFloat")
      ? [regex.FLOAT_REGEX, regex.NON_DIGIT_FLOAT_REGEX]
      : [regex.INT_REGEX, regex.NON_DIGIT_REGEX];
    if (val && val.toString().search(regexPattern) !== 0) {
      val = val.toString().replace(replacePattern, "");
    }
    val = isNaN(val) ? null : val;
    if (this.get("isMaxLengthRequired") && val.length < this.get("maxlength")) {
      this.set("value", this.get("previousValue"));
      return false;
    }
    if (val === null) {
      this.set("value", "");
      return;
    }
    if (val !== "") {
      this.set("value", +(+val).toFixed((this.get("maxlength") || 6) - 2));
    }
    if (isNaN(val)) {
      this.set("value", "");
      return false;
    }

    if (this.shouldUpdate()) {
      this.get("onSettingInput")(this.get("name"), val);
    }
  },

  shouldUpdate() {
    let newValue = this.get("value");
    let oldValue = this.get("previousValue");
    const dummy = Math.random();
    (newValue === "" || newValue === null) && (newValue = dummy);
    (oldValue === "" || oldValue === null) && (oldValue = dummy);
    return Math.abs(newValue - oldValue);
  },

  focusIn() {
    this.onFocusIn && this.onFocusIn();
    this.addCssStyle();
  },

  addCssStyle() {
    Ember.$(this.element).addClass("numeric-inline-input");
    this.set("previousValue", this.get("value"));
  },

  click() {
    this.addCssStyle();
  },

  willDestroyElement() {
    this.destroy();
  }
});
