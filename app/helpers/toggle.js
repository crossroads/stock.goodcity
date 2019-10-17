import Ember from "ember";

/**
 * A toggle action builder
 *
 * Example:
 *
 * <button {{action (toggle model "myBoolProperty")}}>
 *  Value: {{ model.myBoolProperty }}
 * </button>
 *
 * @param {Object} self the object on which to toggle the property
 * @param {String} propName the name of the property to toggle
 * @returns {Function} the action that toggles the property
 */
export default Ember.Helper.helper(function([self, propName]) {
  return function() {
    Ember.set(self, propName, !Ember.get(self, propName));
  };
});
