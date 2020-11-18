import Ember from "ember";
import AutoResizableTextarea from "./auto-resize-textarea";

export default AutoResizableTextarea.extend({
  previousValue: "",
  store: Ember.inject.service(),
  item: null,

  didInsertElement() {
    this.handleSiblings();
  },

  handleSiblings() {
    if (this.hasError()) {
      return this.showSiblings();
    }
    this.hideSiblings();
  },

  hasError() {
    const value = (this.get("value") || "").trim();
    return !value && this.get("require");
  },

  didRender() {
    this.handleSiblings();
  },

  showSiblings() {
    Ember.$(this.element)
      .siblings()
      .show();
  },

  hideSiblings() {
    Ember.$(this.element)
      .siblings()
      .hide();
  },

  keyDown() {
    var value = this.element.value;
    if (value.charCodeAt(value.length - 1) === 10 && event.which === 13) {
      return false;
    }
  },

  async focusOut() {
    if (this.hasError()) {
      this.showSiblings();
      return false;
    }
    this.onFocusOut && this.onFocusOut();
  },

  addCssStyle() {
    Ember.$(this.element).addClass("item-description-textarea-withbg");
    this.set("previousValue", this.get("value") || "");
  },

  click() {
    this.addCssStyle();
  },

  focusIn() {
    this.addCssStyle();
    this.get("onFocusIn") && this.get("onFocusIn")();
  }
});
