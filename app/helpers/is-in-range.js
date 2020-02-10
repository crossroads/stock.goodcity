import Ember from "ember";

/**
 * @module Helpers/is-in-range
 * @description Returns true if a value is within a range
 * @property {number} val the value to check
 * @property {number} min the minimum value allowed
 * @property {number} max the maximum value allowed
 * @example
 *
 * {{input type="number" value=quantity change=(clamp this 'quantity' 1 10) }}
 *
 */
export default Ember.Helper.helper(function([val, min, max]) {
  return val >= min && val <= max;
});
