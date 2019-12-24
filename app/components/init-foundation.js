import { computed } from "@ember/object";
import Component from "@ember/component";

export default Component.extend({
  foundation: null,

  currentClassName: computed("className", function() {
    return this.get("className") ? `.${this.get("className")}` : document;
  }),

  didInsertElement() {
    this._super();
    this.set("foundation", this.get("currentClassName"));
  }
});
