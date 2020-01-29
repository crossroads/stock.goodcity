import Component from "@ember/component";

const REFS = {};

/**
 * Base class for creating singleton global components
 *
 * This type of component cannot be instanciated more than once
 *
 */
export default Component.extend({
  init(name) {
    this._super();
    this.set("name", name);

    if (!name) {
      throw new Error("Singleton component must be named");
    }

    if (REFS[name]) {
      throw new Error(
        "Singleton component cannot be instanciated more than once"
      );
    }

    this.set("elementId", name);

    REFS[name] = true;
  },

  willDestroyElement() {
    delete REFS[this.get("name")];
  }
});
