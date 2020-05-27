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

      const noHistory = [1, 2].includes(window.history.length);
      const deepLinked =
        document.referrer && document.referrer.indexOf(config.APP.ORIGIN) < 0;

      if (deepLinked || noHistory) {
        return this.get("router").replaceWith(fallbackRoute);
      }

      window.history.back();
    };
  }
});
