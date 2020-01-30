import { inject as service } from "@ember/service";
import TextField from "@ember/component/text-field";
import config from "stock/config/environment";
import { pluralize } from "ember-inflector";
import _ from "lodash";

export default TextField.extend({
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
  store: service(),
  classNameBindings: ["inlineTextInput"],
  inlineTextInput: false,
  previousValue: "",

  focusOut() {
    const config = {
      value: this.get("value"),
      name: this.get("name"),
      previousValue: this.get("previousValue")
    };
    this.get("onFocusOut")(config);
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
