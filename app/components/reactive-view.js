import Ember from "ember";

/**
 * Re-renders it's content on model change
 *
 * @module Components/reactive-view
 * @augments ember/Component
 * @property {any} model a value to listen to
 *
 * @example
 *
 * {{#reactive-view model=something}}
 *    {{complex-component-to-rerender}}
 * {{/reactive-view}}
 *
 */
export default Ember.Component.extend({
  render: false,

  _model: null,
  model: Ember.computed("_model", {
    get(key) {
      return this.get("_model");
    },
    set(key, value) {
      this.set("_model", value);
      this.triggerRender();
      return value;
    }
  }),

  show() {
    this.set("render", true);
  },

  hide() {
    this.set("render", false);
  },

  triggerRender() {
    this.hide();
    Ember.run.debounce(this, this.show, 200);
  }
});
