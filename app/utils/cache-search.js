import Ember from "ember";
import _ from "lodash";

class CacheSearch {
  constructor(opts = {}) {
    this.cache = {};
  }

  get(key) {
    return this.cache[key];
  }

  set(key, value) {
    this.cache[key] = value;
  }

  setTime(time) {
    this.timeout = time;
  }

  del(key) {
    delete this.cache[key];
  }
}

export default CacheSearch;
