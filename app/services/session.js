import Ember from "ember";
import "../computed/local-storage";

export default Ember.Service.extend({
  authToken: Ember.computed.localStorage(),
  otpAuthKey: Ember.computed.localStorage(),
  language: Ember.computed.localStorage(),
  orderStateFilters: Ember.computed.localStorage(),
  orderTypeFilters: Ember.computed.localStorage(),
  isLoggedIn: Ember.computed.notEmpty("authToken"),
  store: Ember.inject.service(),
  deviceId: Math.random()
    .toString()
    .substring(2),

  currentUser: Ember.computed(function() {
    var store = this.get("store");
    return store.peekAll("user_profile").get("firstObject") || null;
  }).volatile(),

  clear: function() {
    this.set("authToken", null);
    this.set("otpAuthKey", null);
    this.set("orderStateFilters", null);
    this.set("orderTypeFilters", null);
  }
});
