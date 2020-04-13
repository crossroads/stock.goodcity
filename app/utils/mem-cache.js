import Ember from "ember";
import _ from "lodash";

class Cache {
  constructor(opts = {}) {
    this.timeout = opts.timeout || 5 * 60 * 1000;
    this.cache = {};
  }

  static createCacheKey(key) {
    return JSON.stringify(key);
  }

  get(key) {
    const entry = this.cache[key];
    if (entry && entry.expiry >= Date.now()) {
      return entry.value;
    }
  }

  set(key, value) {
    this.cache[key] = {
      value: value,
      expiry: Date.now() + this.timeout
    };
  }

  has(key) {
    return !!this.get(key);
  }

  del(key) {
    delete this.cache[key];
  }

  clear() {
    this.cache = {};
  }
}

export default Cache;
