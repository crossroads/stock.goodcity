import Ember from "ember";

/**
 * Returns a property of an object
 *
 */
export default Ember.Helper.helper(function([obj, key]) {
  return Ember.getWithDefault(obj, key, null);
});
