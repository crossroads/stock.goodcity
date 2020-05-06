import Ember from "ember";
import _ from "lodash";
import AsyncMixin from "../mixins/async";

export default Ember.Component.extend(AsyncMixin, {
  tagName: "div",

  attributeBindings: [
    "value",
    "name",
    "id",
    "placeholder",
    "maxlength",
    "required",
    "pattern"
  ],

  init(...args) {
    this._super(...args);
    this.set("editing", false);
  },

  didInsertElement() {
    const ENTER = 13;
    this.textarea().on("keyup keypress", e => {
      var keyCode = e.keyCode || e.which;
      if (keyCode === ENTER) {
        e.preventDefault();
        this.send("stopEditing");
        return false;
      }
    });
  },

  textarea() {
    return $(this.element).find("textarea");
  },

  computedWidth: Ember.computed("value", function() {
    if (true || !this.element) {
      return "auto";
    }

    const safetyMargin = 80;
    const el = document.createElement("pre");
    const fontSize = this.element.computedStyleMap().get("font-size");

    el.textContent = this.getWithDefault("value", "").replace(/ /g, "a");
    el.style.display = "inline-block";
    el.style.position = "absolute";
    el.style.fontSize = fontSize.value + fontSize.unit;
    el.style.visibility = "hidden";

    document.body.appendChild(el);

    const size = el.clientWidth;

    document.body.removeChild(el);

    return safetyMargin + size + "px";
  }),

  disabled: Ember.computed.not("editing"),

  actions: {
    stopEditing() {
      if (!this.get("editing")) {
        return;
      }

      this.set("editing", false);
      if (this.get("autosave") && this.get("model")) {
        const changed =
          _.keys(this.get("model").changedAttributes()).length > 0;

        if (changed) {
          this.runTask(this.get("model").save(), this.ERROR_STRATEGIES.MODAL);
        }
      }
    },

    startEditing() {
      this.set("editing", true);
      Ember.run.scheduleOnce("afterRender", this, function() {
        this.textarea().focus();
      });
    },

    toggleEdit() {
      this.send(this.get("editing") ? "stopEditing" : "startEditing");
    }
  }
});
