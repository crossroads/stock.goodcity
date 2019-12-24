import { notEmpty } from "@ember/object/computed";
import { computed } from "@ember/object";
import Service, { inject as service } from "@ember/service";
import "../computed/local-storage";
import config from "../config/environment";

export default Service.extend({
  authToken: computed.localStorage(),
  otpAuthKey: computed.localStorage(),
  language: computed.localStorage(),
  isLoggedIn: notEmpty("authToken"),
  store: service(),
  deviceId: Math.random()
    .toString()
    .substring(2),

  currentUser: computed(function() {
    var store = this.get("store");
    return store.peekAll("user_profile").get("firstObject") || null;
  }).volatile(),

  loggedInUser: computed(function() {
    return this.get("store").peekRecord("user", this.get("currentUser.id"));
  }),

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
