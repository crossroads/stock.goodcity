import { on } from "@ember/object/evented";
import { computed } from "@ember/object";
import Component from "@ember/component";

export default Component.extend({
  tagName: "input",
  type: "radio",
  attributeBindings: [
    "name",
    "type",
    "value",
    "checked",
    "labelText",
    "disabled"
  ],
  disabled: false,

  click() {
    this.set("selection", this.$().val());
  },

  checked: computed("selection", function() {
    return this.get("value") === this.get("selection");
  }),

  onInit: on("init", function() {
    if (this.get("value") === this.get("selection")) {
      this.set("checked", true);
    }
  })
});
