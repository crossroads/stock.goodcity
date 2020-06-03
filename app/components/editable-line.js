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

  willDestroyElement() {
    const model = this.get("model");
    const key = this.get("key");

    if (!model || !key) {
      return;
    }

    const chagedAttributes = this.get("model").changedAttributes();
    const changes = chagedAttributes[key];
    if (changes) {
      // Rollback before leaving
      this.model.set(key, changes[0]);
    }
  },

  textarea() {
    return $(this.element).find("textarea");
  },

  disabled: Ember.computed.not("editing"),

  actions: {
    stopEditing() {
      if (!this.get("editing") || !this.get("value")) {
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
