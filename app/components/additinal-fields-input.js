import Ember from "ember";
import AjaxPromise from "stock/utils/ajax-promise";
import config from "../config/environment";
import Inflector from "ember-inflector";
import { singularize, pluralize } from "ember-inflector";
const { getOwner } = Ember;
import _ from "lodash";

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
  classNameBindings: ["class"],
  previousValue: "",

  focusOut() {
    let detailType = this.get("detailType").toLowerCase();
    let apiEndpoint = pluralize(detailType);
    let detailId = this.get("detailId");
    var url = `/${apiEndpoint}/${detailId}`;
    var key = this.get("name");
    var packageDetailParams = {
      [_.snakeCase(key)]: this.get("value") || ""
    };
    Ember.$(this.element).removeClass("inline-text-input");
    if (
      this.valueChanged(packageDetailParams[key], this.get("previousValue"))
    ) {
      var loadingView = getOwner(this)
        .lookup("component:loading")
        .append();
      new AjaxPromise(url, "PUT", this.get("session.authToken"), {
        [detailType]: packageDetailParams
      })
        .then(data => {
          this.get("store").pushPayload(data);
        })
        .finally(() => {
          loadingView.destroy();
        });
    }
  },

  valueChanged(newValue, previousValue) {
    return newValue !== previousValue;
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
