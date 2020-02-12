import Ember from "ember";
import config from "stock/config/environment";

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
export default Ember.Helper.extend({
  compute(_, { fallbackRoute = "/" }) {
    return () => {
      const isRoot = location.pathname === "/";

      if (isRoot) {
        return;
      }

      const noHistory = window.history.length === 1;
      const deepLinked =
        document.referrer && document.referrer.indexOf(config.APP.NAME) < 0;

      if (deepLinked || noHistory) {
        return this.get("router").replaceWith(fallbackRoute);
      }

      window.history.back();
    };
  }
});
