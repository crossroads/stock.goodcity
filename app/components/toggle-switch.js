import Ember from "ember";
import _ from "lodash";

/**
 * Fancy toggle-switch component, wraps a checkbox internally
 *
 * @property {boolean} value a property the component will bind to
 * @property {function} [afterChange] a callback triggered after value changes
 * <br> We typically listen to data change with Ember observers in the
 * <br> controllers. But those are likely to unwanted changes as well.
 * <br> The callback can be used to react to changes that exclusively belong
 * <br> to the checkbox
 *
 */
export default Ember.Component.extend({
  attributeBindings: ["value"],
  disabled: false,

  init() {
    this._super(...arguments);
    this.addObserver("value", () => {
      Ember.run.next(() => {
        const val = this.get("value");
        this.getWithDefault("after-change", _.noop)(val);
      });
    });
  }
});
