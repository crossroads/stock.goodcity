import Ember from "ember";
import AjaxPromise from "stock/utils/ajax-promise";
import config from "../config/environment";
import Inflector from "ember-inflector";
import { singularize, pluralize } from "ember-inflector";
const { getOwner } = Ember;

export default Ember.TextField.extend({
  tagName: "input",
  type: "text",
  isMobileApp: config.cordova.enabled,
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
  displayScanner: false,
  item: null,

  focusTrigger: Ember.observer("value", function() {
    this.$().focus();
  }),

  controllerNameEnd: Ember.computed("detailType", function() {
    return `${detailType.toLowerCase()}s`;
  }),

  focusOut() {
    var item = this.get("item");
    let detail_type = pluralize("Computer accessory").toLowerCase();
    let detail_id = item.get("detailId");
    var url = `/${detail_type}/${detail_id}`;
    var key = this.get("name");
    var packageParams = {};
    packageParams[key] = this.get("value") || "";
    var value = this.attrs.value.value || "";
    var regexPattern = /^(CAS\-\d{5})$/;

    if (value && value.toString().search(regexPattern) !== 0) {
      this.set("value", this.get("previousValue"));
      this.$().focus();
      Ember.$("#CAS-error" + item.id).show();
      return false;
    }

    Ember.$(this.element).removeClass("inline-text-input");
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
    Ember.$(this.element).removeClass("inline-text-input");
    Ember.$("#CAS-error" + item.id).hide();
    Ember.run.debounce(this, this.removeScanner, 2000);
  },

  focusIn() {
    this.addCssStyle();
  },

  addCssStyle() {
    Ember.$(this.element).addClass("inline-text-input");
    this.set("previousValue", this.get("value") || "");
  },

  click() {
    this.addCssStyle();
    this.set("previousValue", this.get("value") || "");
  }
});
