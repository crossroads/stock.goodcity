import Ember from "ember";
import config from "stock/config/environment";
import { pluralize } from "ember-inflector";
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
  classNameBindings: ["inlineTextInput"],
  inlineTextInput: false,
  previousValue: "",

  focusOut() {
    this.get("onFocusOut")(
      this.get("value"),
      this.get("name"),
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
