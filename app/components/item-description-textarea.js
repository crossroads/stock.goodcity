import Ember from "ember";
import AutoResizableTextarea from "./auto-resize-textarea";
import AjaxPromise from "stock/utils/ajax-promise";
const { getOwner } = Ember;

export default AutoResizableTextarea.extend({
  previousValue: "",
  store: Ember.inject.service(),
  item: null,

  didInsertElement() {
    Ember.$(".description-error").hide();
  },

  keyDown() {
    var value = this.element.value;
    if (value.charCodeAt(value.length - 1) === 10 && event.which === 13) {
      return false;
    }
  },

  focusOut() {
    var item = this.get("item");
    var url = `/packages/${item.get("id")}`;
    var key = this.get("name");
    var value = this.attrs.value.value || "";
    var packageParams = {};
    packageParams[key] = this.get("value").trim() || "";

    if (
      packageParams[key].toString() !==
        this.get("previousValue")
          .toString()
          .trim() &&
      value !== ""
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
    this.element.value = value.trim();
    if (this.element.value === "") {
      this.$().focus();
      return false;
    }
    Ember.$(this.element).removeClass("item-description-textarea");
  },

  focusIn() {
    this.addCssStyle();
  },

  addCssStyle() {
    if (!this.get("noCss")) {
      Ember.$(this.element).addClass("item-description-textarea");
    }
    this.set("previousValue", this.get("value") || "");
  },

  click() {
    this.addCssStyle();
  }
});
