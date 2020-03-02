import Ember from "ember";

/**
 * @module Helpers/clamp
 * @description Builds an action which sets a value within a range
 * @property {any} self the entity which holds the property
 * @property {string} propName the name of the property to toggle
 * @property {number} min the minimum value allowed
 * @property {number} max the maximum value allowed
 * @example
 *
 * {{input type="number" value=quantity change=(clamp this 'quantity' 1 10) }}
 *
 */
export default Ember.Helper.helper(function([self, propName, min, max]) {
  return function(input) {
    let num;

    if (input instanceof jQuery.Event) {
      num = Number(input.target.value);
    } else {
      num = Number(input);
    }

    if (num < min) {
      num = min;
    }
    if (num > max) {
      num = max;
    }
    Ember.set(self, propName, num);
  };
});
