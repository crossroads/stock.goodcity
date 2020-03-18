import Ember from "ember";
import _ from "lodash";

class Cache {
  constructor(opts = {}) {
    this.timeout = opts.timeout || 5 * 60 * 1000;
    this.cache = {};
  }

  get(key) {
    return this.cache[key];
  }

  set(key, value) {
    this.cache[key] = value;
  }

  has(key) {
    return this.cache[key];
  }

  del(key) {
    delete this.cache[key];
  }
}

export default Cache;
