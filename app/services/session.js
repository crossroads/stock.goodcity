import Ember from "ember";
import "../computed/local-storage";
import config from "../config/environment";

export default Ember.Service.extend({
  authToken: Ember.computed.localStorage(),
  otpAuthKey: Ember.computed.localStorage(),
  language: Ember.computed.localStorage(),
  isLoggedIn: Ember.computed.notEmpty("authToken"),
  store: Ember.inject.service(),
  deviceId: Math.random()
    .toString()
    .substring(2),

  currentUser: Ember.computed(function() {
    var store = this.get("store");
    return store.peekAll("user_profile").get("firstObject") || null;
  }).volatile(),

  userDefaultPrinter: function() {
    const store = this.get("store");
    return store.peekRecord("user", this.get("currentUser.id")).get("printer");
  },

  clear: function() {
    this.set("authToken", null);
    this.set("language", null);
    this.set("otpAuthKey", null);
  },

  unloadSessionData() {
    const store = this.get("store");
    config.APP.USER_DATA_TYPES.forEach(name => {
      store.unloadAll(name);
    });
  }
});
