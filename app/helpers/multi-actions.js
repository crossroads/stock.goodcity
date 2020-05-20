import Ember from "ember";

/**
 * @module Helpers/multi-actions
 * @description Allows running multiple actions
 * @property {...functions} actions the actions to run
 * @example
 *
 * <button {{action (multi-actions
 *    (action "doThis")
 *    (action "doThat")
 *    (action "andThenThis")
 *  )
 * }}>
 *  Submit
 * </button>
 *
 */
export default Ember.Helper.helper(function(actions) {
  return async function() {
    for (let action of actions) {
      await action();
    }
  };
});
