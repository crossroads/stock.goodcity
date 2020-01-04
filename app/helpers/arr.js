import Ember from "ember";

/**
 * Returns an array
 *
 * Example:
 *
 * {{#my-component
 *   data=(arr 'val1' 'val2' 'val3')
 * }}
 *
 */
export default Ember.Helper.helper(function(args) {
  return args;
});
