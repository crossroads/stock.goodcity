import Ember from "ember";
import AjaxPromise from "stock/utils/ajax-promise";
const { getOwner } = Ember;

export default Ember.TextField.extend({
  tagName: "input",
  type: "text",
  attributeBindings: [
    "name",
    "type",
    "value",
    "maxlength",
    "id",
    "autoFocus",
    "placeholder",
    "required",
    "pattern"
  ],
  store: Ember.inject.service(),
  previousValue: "",

  whichKey(e, key) {
    var keyList = [13, 8, 9, 39, 46, 32];
    return (
      (e.ctrlKey && key === 86) ||
      keyList.indexOf(key) >= 0 ||
      (key >= 35 && key <= 37) ||
      (key >= 65 && key <= 90) ||
      (key >= 96 && key <= 122)
    );
  },

  keyDown(e) {
    var key = e.charCode || e.keyCode || 0;
    // allow ctrl+v, enter, backspace, tab, delete, numbers, keypad numbers
    // home, end only.
    var keyPressed = this.whichKey(e, key);
    return keyPressed;
  },

  focusOut() {
    const field = this.attrs.name;
    const value = this.attrs.value.value.trim() || "";
    const beneficiary = this.get("beneficiary");
    const url = `/beneficiaries/${beneficiary.get("id")}`;
    const beneficiaryParams = {};

    beneficiaryParams[field] = value;

    if (!value) {
      this.set("value", this.get("previousValue"));
      Ember.$(this.element).removeClass("inline-text-input");
      return false;
    }

    Ember.$(this.element).removeClass("inline-text-input");
    if (value !== this.get("previousValue")) {
      var loadingView = getOwner(this)
        .lookup("component:loading")
        .append();
      new AjaxPromise(url, "PUT", this.get("session.authToken"), {
        beneficiary: beneficiaryParams
      })
        .then(data => {
          this.get("store").pushPayload(data);
        })
        .finally(() => {
          loadingView.destroy();
        });
    }
    Ember.$(this.element).removeClass("inline-text-input");
  },

  focusIn() {
    this.addCssStyle();
  },

  addCssStyle() {
    Ember.$(this.element).addClass("inline-text-input");
  },

  click() {
    this.addCssStyle();
    this.set("previousValue", this.get("value") || "");
  },

  willDestroyElement() {
    this.destroy();
  }
});
