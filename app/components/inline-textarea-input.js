import Ember from "ember";
import AutoResizableTextarea from "./auto-resize-textarea";
import AjaxPromise from "stock/utils/ajax-promise";
const { getOwner } = Ember;

export default AutoResizableTextarea.extend({
  previousValue: "",
  store: Ember.inject.service(),
  order: null,
  orderCopy: Ember.computed.readOnly("order"),

  keyDown() {
    var value = this.element.value;
    if (value.charCodeAt(value.length - 1) === 10 && event.which === 13) {
      return false;
    }
  },

  focusOut() {
    const orderId = this.get("order.id");
    const key = this.get("name");
    const value = this.attrs.value.value || "";
    let orderParams = {};
    orderParams[key] = this.get("value").trim() || "";
    let element = this.element;

    if (
      orderParams[key].toString() !==
        this.get("previousValue")
          .toString()
          .trim() &&
      value !== ""
    ) {
      this.get("onFocusOut")(value);
    }
    this.element.value = value.trim();
    if (this.element.value === "") {
      this.$().focus();
      Ember.$(this.element)
        .siblings()
        .show();
      return false;
    }
    this.removeCssStyle();
  },

  focusIn() {
    this.addCssStyle();
  },

  removeCssStyle() {
    Ember.$(this.element).removeClass("item-description-textarea");
  },

  addCssStyle() {
    Ember.$(this.element).addClass("item-description-textarea");
  },

  click() {
    this.addCssStyle();
  }
});
