import Ember from "ember";

/**
 * Finds and returns one element of an array
 *
 * Example:
 *
 * {{#my-component
 *   data=(array-find array 'name' 'steve')
 * }}
 *
 */
export default Ember.Helper.helper(function([list, key, value]) {
  return (list || []).find(it => Ember.get(it, key) == value);
});
