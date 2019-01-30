import Ember from "ember";

export default Ember.Service.extend({
  read(key, defaultValue) {
    return JSON.parse(window.localStorage.getItem(key)) || defaultValue;
  },

  readString(key, defaultValue) {
    return window.localStorage.getItem(key) || defaultValue;
  },

  write(key, val) {
    this.writeString(key, JSON.stringify(val));
    return val;
  },

  writeString(key, val) {
    window.localStorage.setItem(key, val);
    return val;
  },

  remove(key) {
    window.localStorage.removeItem(key);
  }
});
