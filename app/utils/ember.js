import _ from "lodash";
import Ember from "ember";

/**
 * Creates an observer that calls a method based on the value
 *
 * @export
 * @param {sring} prop
 * @param {Array<Array>} valueCallbacks
 * @returns {Ember/observer}
 */
export function callbackObserver(prop, valueCallbacks) {
  return Ember.observer(prop, function() {
    const value = this.get(prop);

    for (let [val, func] of valueCallbacks) {
      if (val === value) {
        return _.get(this, func, _.noop).apply(this, [value]);
      }
    }
  });
}
