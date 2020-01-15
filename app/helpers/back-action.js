import { helper as buildHelper } from "@ember/component/helper";

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
export default buildHelper(function([self, propName]) {
  return function() {
    window.history.back();
  };
});
