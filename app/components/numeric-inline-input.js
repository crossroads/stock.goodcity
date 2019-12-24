import $ from "jquery";
import { inject as service } from "@ember/service";
import TextField from "@ember/component/text-field";
import { getOwner } from "@ember/application";
import AjaxPromise from "stock/utils/ajax-promise";

export default TextField.extend({
  store: service(),
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

  keyUp: function() {
    var value = this.attrs.value.value;
    var regexPattern = /^\d+$/;
    if (value && value.toString().search(regexPattern) !== 0) {
      this.set("value", value.replace(/\D/g, ""));
    }
    return true;
  },

  whichKey(e, key) {
    var keyList = [13, 8, 9, 39, 46];
    return (
      (e.ctrlKey && key === 86) ||
      keyList.indexOf(key) >= 0 ||
      (key >= 35 && key <= 37) ||
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
    var val = this.attrs.value.value;
    var regexPattern = /^\d+$/;
    if (val && val.toString().search(regexPattern) !== 0) {
      this.set("value", val.replace(/\D/g, ""));
    }
    var item = this.get("item");
    var url = `/packages/${item.get("id")}`;
    var key = this.get("name");
    var packageParams = {};
    packageParams[key] = this.get("value") || "";

    if (parseInt(packageParams[key], 10) === 0) {
      $(this.element).removeClass("numeric-inline-input");
      this.set("value", "");
      return false;
    }

    $(this.element).removeClass("numeric-inline-input");
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
  },

  focusIn() {
    this.addCssStyle();
  },

  addCssStyle() {
    $(this.element).addClass("numeric-inline-input");
    this.set("previousValue", this.get("value") || "");
  },

  click() {
    this.addCssStyle();
  }
});
