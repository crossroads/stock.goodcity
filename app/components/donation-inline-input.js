import { debounce } from "@ember/runloop";
import $ from "jquery";
import { observer } from "@ember/object";
import { inject as service } from "@ember/service";
import TextField from "@ember/component/text-field";
import { getOwner } from "@ember/application";
import AjaxPromise from "stock/utils/ajax-promise";
import config from "../config/environment";

export default TextField.extend({
  tagName: "input",
  type: "text",
  isMobileApp: config.cordova.enabled,
  isEditable: false,
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
  displayScanner: false,
  item: null,

  focusTrigger: observer("value", function() {
    this.$().focus();
  }),

  didInsertElement() {
    var id = this.get("item.id");
    $("#CAS-error" + id).hide();
  },

  removeScanner() {
    this.set("displayScanner", false);
  },

  focusOut() {
    var item = this.get("item");
    var url = `/packages/${item.get("id")}`;
    var key = this.get("name");
    var packageParams = {};
    packageParams[key] = this.get("value") || "";
    var value = this.attrs.value.value || "";
    var regexPattern = /^(CAS\-\d{5})$/;

    if (value && value.toString().search(regexPattern) !== 0) {
      this.set("value", this.get("previousValue"));
      this.$().focus();
      $("#CAS-error" + item.id).show();
      return false;
    }

    $(this.element).removeClass("inline-text-input");
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
    $(this.element).removeClass("inline-text-input");
    $("#CAS-error" + item.id).hide();
    debounce(this, this.removeScanner, 2000);
  },

  focusIn() {
    this.addCssStyle();
  },

  addCssStyle() {
    $(this.element).addClass("inline-text-input");
    if (this.get("isMobileApp")) {
      this.set("displayScanner", true);
    }
  },

  click() {
    this.addCssStyle();
    this.set("previousValue", this.get("value") || "");
  }
});
