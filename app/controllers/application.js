import Ember from "ember";
import config from "../config/environment";

export default Ember.Controller.extend({
  subscription: Ember.inject.service(),
  cordova: Ember.inject.service(),
  store: Ember.inject.service(),
  designationService: Ember.inject.service(),
  locationService: Ember.inject.service(),
  packageService: Ember.inject.service(),
  packageTypeService: Ember.inject.service(),
  organisationService: Ember.inject.service(),
  offerService: Ember.inject.service(),
  messagesUtil: Ember.inject.service("messages"),
  app_id: config.APP.ANDROID_APP_ID,
  ios_app_id: config.APP.APPLE_APP_ID,
  appTitle: config.APP.TITLE,
  bannerImage: config.APP.BANNER_IMAGE,
  bannerReopenDays: config.BANNER_REOPEN_DAYS,
  isMobileApp: config.cordova.enabled,
  notifications: Ember.inject.controller(),

  initSubscription: Ember.on("init", function() {
    this.get("subscription").wire();
    if (this.get("isMobileApp") && cordova.platformId === "android") {
      // jshint ignore:line
      this.redirectToItem();
    }
  }),

  redirectToItem() {
    universalLinks &&
      universalLinks.subscribe("redirectToItem", eventData => {
        // jshint ignore:line
        this.transitionToRoute(eventData.path);
      });
  },

  actions: {
    logMeOut() {
      this.session.clear(); // this should be first since it updates isLoggedIn status
      this.get("subscription").unwire();
      this.get("notifications").send("unloadNotifications");
      this.get("session").unloadSessionData();
      this.session.clearCache();
      this.transitionToRoute("login");
    },

    setSubscription() {
      this.get("subscription").wire();
    }
  }
});
