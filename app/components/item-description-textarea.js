import Ember from "ember";
import AutoResizableTextarea from "./auto-resize-textarea";
import AjaxPromise from "stock/utils/ajax-promise";
const { getOwner } = Ember;

export default AutoResizableTextarea.extend({
  previousValue: "",
  store: Ember.inject.service(),
  item: null,

  didInsertElement() {
    const value = (this.get("value") || "").trim();
    if (!value && this.get("require")) {
      return this.showSiblings();
    }
    this.hideSiblings();
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

  focusOut() {
    this.onFocusOut && setTimeout(() => this.onFocusOut(), 120);
    var item = this.get("item");
    var url = `/packages/${item.get("id")}`;
    var key = this.get("name");
    const value = (this.get("value") || "").trim();
    var packageParams = {};
    packageParams[key] = value;

    if (!value && this.get("require")) {
      this.showSiblings();
      return false;
    }
    if (
      packageParams[key].toString() !==
      this.get("previousValue")
        .toString()
        .trim()
    ) {
      var loadingView = getOwner(this)
        .lookup("component:loading")
        .append();
      new AjaxPromise(url, "PUT", this.get("session.authToken"), {
        package: packageParams
      })
        .then(data => {
          this.get("store").pushPayload(data);
          this.hideSiblings();
        })
        .finally(() => {
          loadingView.destroy();
        });
    }
    Ember.$(this.element).removeClass("item-description-textarea-withbg");
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
