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
  subformDetailService: Ember.inject.service(),
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
  classNameBindings: ["inlineTextInput"],
  inlineTextInput: false,
  previousValue: "",

  focusOut() {
    const detailType = _.snakeCase(this.get("detailType")).toLowerCase();
    const apiEndpoint = pluralize(detailType);
    const detailId = this.get("detailId");
    const url = `/${apiEndpoint}/${detailId}`;
    const key = this.get("name");
    const snakeCaseKey = _.snakeCase(key);
    const packageDetailParams = {
      [snakeCaseKey]: this.get("value") || ""
    };
    const paramsObj = { detailType, url, snakeCaseKey, packageDetailParams };
    Ember.$(this.element).removeClass("inline-text-input");
    this.get("subformDetailService").updateRequest(
      paramsObj,
      this.get("previousValue")
    );
    this.set("inlineTextInput", false);
  },

  focusIn() {
    this.addCssStyle();
  },

  addCssStyle() {
    this.set("inlineTextInput", true);
    this.set("previousValue", this.get("value") || "");
  },

  click() {
    this.addCssStyle();
  }
});
