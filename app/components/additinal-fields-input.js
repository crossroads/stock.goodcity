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
  item: null,
  classNameBindings: ["class"],
  previousValue: "",

  focusOut() {
    var item = this.get("item");
    let detailType = pluralize(this.get("detailType")).toLowerCase();
    let detailId = this.get("detailId");
    var url = `/${detailType}/${detailId}`;
    console.log(url);
    var key = this.get("name");
    console.log(key, "hit");
    var packageParams = {};
    packageParams[key] = this.get("value") || "";
    console.log(this.get("previousValue"), "hit");
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
  }
});
