import $ from "jquery";
import { inject as service } from "@ember/service";
import TextField from "@ember/component/text-field";
import { getOwner } from "@ember/application";
import AjaxPromise from "stock/utils/ajax-promise";

export default TextField.extend({
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
  store: service(),
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
    var value = this.attrs.value.value || "";
    var beneficiary = this.get("beneficiary");
    var url = `/beneficiaries/${beneficiary.get("id")}`;
    var beneficiaryParams = {};
    beneficiaryParams["first_name"] = value.split(" ")[0];
    beneficiaryParams["last_name"] = value.split(" ")[1];

    if (value.length <= 8 && value.split(" ").length < 2) {
      this.set("value", this.get("previousValue"));
      $(this.element).removeClass("inline-text-input");
      return false;
    }

    $(this.element).removeClass("inline-text-input");
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
    $(this.element).removeClass("inline-text-input");
  },

  focusIn() {
    this.addCssStyle();
  },

  addCssStyle() {
    $(this.element).addClass("inline-text-input");
  },

  click() {
    this.addCssStyle();
    this.set("previousValue", this.get("value") || "");
  }
});
