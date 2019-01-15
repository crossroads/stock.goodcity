import Ember from "ember";

export default Ember.Service.extend({
  read(key, defaultValue) {
    return JSON.parse(window.localStorage.getItem(key)) || defaultValue;
  },

  write(key, val) {
    window.localStorage.setItem(key, JSON.stringify(val));
    return val;
  },

  remove(key) {
    window.localStorage.removeItem(key);
  }
});
