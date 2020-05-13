import Ember from "ember";

/**
 * @module Helpers/chain-actions
 * @description Allows running multiple successive actions
 * @property {...functions} actions the actions to run
 * @example
 *
 * <button {{action (chain-actions
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
