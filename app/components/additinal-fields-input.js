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
  item: null
});
