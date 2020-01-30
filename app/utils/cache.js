import { resolve, reject } from "rsvp";
import _ from "lodash";

let CACHE_IDS = [];

/**
 * @module Utils/cache
 */
export default {
  /**
   * @description Wraps the function, allowing only the first call to go through. Any subsequent call will use the cached result
   *
   * @param {function} func the source method
   * @returns {function} a wrapper function which will only ever execute `func` once
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
   * @description
   *  <br> Will call func only if it hasn't been exectuted before
   *  <br> Warning: This method does not return the value of the exectured method
   *
   *  @param {string} cacheId the cache key
   *  @param {string} func the method to resolve missing value
   *  @param {any} [scope] scope to bind the method to (default=null)
   *  @param {...any} [args] arguments passed to the method
   *  @returns {any}
   */
  exec(cacheId, func, scope = null, ...args) {
    if (_.includes(CACHE_IDS, cacheId)) {
      return resolve();
    }

    CACHE_IDS.push(cacheId);

    return resolve(func.apply(scope, args))
      .then(_.noop)
      .catch(e => {
        _.pull(CACHE_IDS, cacheId);
        return reject(e);
      });
  }
};
