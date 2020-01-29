import { on } from "@ember/object/evented";
import { inject as service } from "@ember/service";
import Controller, { inject as controller } from "@ember/controller";
import config from "../config/environment";

export default Controller.extend({
  subscription: service(),
  cordova: service(),
  store: service(),
  designationService: service(),
  locationService: service(),
  packageService: service(),
  app_id: config.APP.ANDROID_APP_ID,
  ios_app_id: config.APP.APPLE_APP_ID,
  appTitle: config.APP.TITLE,
  bannerImage: config.APP.BANNER_IMAGE,
  bannerReopenDays: config.BANNER_REOPEN_DAYS,
  isMobileApp: config.cordova.enabled,
  notifications: controller(),

  initSubscription: on("init", function() {
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
      this.transitionToRoute("login");
    }
  }
});
