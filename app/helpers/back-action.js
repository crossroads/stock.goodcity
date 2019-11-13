import Ember from "ember";

/**
 * Creates an action which backs to the previous page
 *
 * Example:
 *
 * <button {{action (back-action)}}>
 *  Go Back
 * </button>
 *
 * @returns {Function} the back action
 */
export default Ember.Helper.helper(function([self, propName]) {
  return function() {
    window.history.back();
  };
});
