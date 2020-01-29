import { next } from "@ember/runloop";
import Component from "@ember/component";
import _ from "lodash";

/**
 * Fancy toggle-switch component, wraps a checkbox internally
 *
 * @module Components/toggle-switch
 * @augments ember/Component
 * @property {boolean} value a property the component will bind to
 * @property {function} [afterChange] a callback triggered after value changes
 * <br> We typically listen to data change with Ember observers in the
 * <br> controllers. But those are likely to react to unwanted changes even
 * <br> after the page has been closed (controllers persist)
 * <br> This callback can be used to react to changes that exclusively belong
 * <br> to the checkbox
 *
 * @example
 *
 * {{toggle-switch
 *    disabled=(unless allowPublish true)
 *    on-icon='eye'
 *    off-icon='eye-slash'
 *    on-text=(t 'item_filters.published')
 *    off-text=(t 'item_filters.private')
 *    value=model.allowWebPublish
 *    after-change=(action 'persistModel')
 * }}
 *
 */
export default Component.extend({
  attributeBindings: ["value"],
  disabled: false,

  init() {
    this._super(...arguments);
    this.addObserver("value", () => {
      next(() => {
        const val = this.get("value");
        this.getWithDefault("after-change", _.noop)(val);
      });
    });
  }
});
