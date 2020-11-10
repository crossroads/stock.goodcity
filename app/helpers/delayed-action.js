import Ember from "ember";

/**
 * @module Helpers/delayed-actions
 * @description Invoke action with with a specified delay (default=120ms)
 * @property {function} action the action to be executed after some delay
 * @example
 *
 * <button {{action (delayed-action (action 'doSomething') 200)}}>
 *  Submit
 * </button>
 *
 *
 * <button {{action (delayed-action (action 'doSomething'))}}>
 *  Submit
 * </button>
 */
export default Ember.Helper.helper(function([action, delay = 120]) {
  return async function() {
    return setTimeout(async () => {
      await action();
    }, delay);
  };
});
