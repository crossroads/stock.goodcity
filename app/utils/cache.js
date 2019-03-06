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
    return function (...args) {
      if (!called) {
        result = func.apply(this, args);
        called = true;
      }
      return result;
    };
  }
};
