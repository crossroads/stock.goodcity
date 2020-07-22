import Ember from "ember";

/**
 * Returns a property of an object
 *
 */
export default Ember.Helper.helper(function([obj, key, defaultValue = null]) {
  if (!obj) return defaultValue;
  return Ember.getWithDefault(obj, key, defaultValue);
});
