import Ember from "ember";
import AjaxPromise from "stock/utils/ajax-promise";
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
    let val = this.attrs.value.value;
    var regexPattern = this.get("acceptFloat") ? /^\d+\.?\d+$/g : /^\d+$/;
    if (val && !val.toString().match(regexPattern)) {
      val = val.toString().replace(/[^\d\.]/g, "");
    }

    val = this.get("acceptFloat")
      ? parseFloat(this.get("value"))
      : +this.get("value");
    this.set("value", val || null);

    this.onFocusOut && this.onFocusOut();

    if (!this.skipSave) {
      var item = this.get("item");
      var url = `/packages/${item.get("id")}`;
      var key = this.get("name");
      var packageParams = {};
      packageParams[key] = this.get("value") || "";

      if (isNaN(packageParams[key])) {
        this.set("value", "");
        return false;
      }

      if (
        packageParams[key].toString() !== this.get("previousValue").toString()
      ) {
        var loadingView = getOwner(this)
          .lookup("component:loading")
          .append();
        new AjaxPromise(url, "PUT", this.get("session.authToken"), {
          package: packageParams
        })
          .then(data => {
            this.get("store").pushPayload(data);
          })
          .finally(() => {
            loadingView.destroy();
          });
      }
    }
    Ember.$(this.element).removeClass("numeric-inline-input");
  },

  focusIn() {
    this.addCssStyle();
    this.onFocusIn && this.onFocusIn();
  },

  addCssStyle() {
    Ember.$(this.element).addClass("numeric-inline-input");
    this.set("previousValue", this.get("value") || "");
  },

  click() {
    this.addCssStyle();
  }
});
