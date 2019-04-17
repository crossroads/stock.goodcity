import Ember from "ember";
import _ from "lodash";

let CACHE_IDS = [];

export default {
  /**
   * Wraps the function, allowing only the first call to go through. Any subsequent call will use the cached result
   *
   * @param {*} func
   * @returns
   */
  once(func) {
    let result = null;
    let called = false;
    return function(...args) {
      if (!called) {
        result = func.apply(this, args);
        called = true;
      }
      return result;
    };
  },

  /**
   *
   * Will call func only if it hasn't been exectuted before
   * Warning: This method does not return the value of the exectured method
   *
   */
  exec(cacheId, func, scope = null, ...args) {
    if (_.includes(CACHE_IDS, cacheId)) {
      return Ember.RSVP.resolve();
    }

    CACHE_IDS.push(cacheId);

    return Ember.RSVP.resolve(func.apply(scope, args))
      .then(_.noop)
      .catch(e => {
        _.pull(CACHE_IDS, cacheId);
        return Ember.RSVP.reject(e);
      });
  }
};
