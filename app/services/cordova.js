import Ember from "ember";
import config from "../config/environment";
import AjaxPromise from "../utils/ajax-promise";

export default Ember.Service.extend({
  session: Ember.inject.service(),
  store: Ember.inject.service(),
  routing: Ember.inject.service("-routing"),

  isAndroid() {
    if (!config.cordova.enabled || !window.device) {
      return;
    }
    return (
      ["android", "Android", "amazon-fireos"].indexOf(window.device.platform) >=
      0
    );
  },

  isIOSBrowser() {
    const userAgent = window.navigator.userAgent;
    return userAgent.match(/iPad/i) || userAgent.match(/iPhone/i);
  },

  isIOS() {
    if (!config.cordova.enabled || !window.device) {
      return;
    }
    return window.device.platform === "iOS";
  },

  appLoad() {
    if (!config.cordova.enabled) {
      return;
    }
    this.initiatePushNotifications();
  },

  initiatePushNotifications() {
    var _this = this;

    function onDeviceReady() {
      // jshint ignore:line
      var push = PushNotification.init({
        // jshint ignore:line
        android: {
          senderID: config.cordova.FcmSenderId,
          badge: false,
          icon: "ic_notify"
        },
        ios: {
          alert: true,
          sound: true
        },
        windows: {}
      });

      push.on("registration", function(data) {
        sendToken(data.registrationId, platformCode());
      });

      push.on("notification", function(data) {
        if (!data.additionalData.foreground) {
          processTappedNotification(data.additionalData);
        }
      });

      push.on("error", function(err) {
        console.log(err);
      });
    }

    function sendToken(handle, platform) {
      // jshint ignore:line
      return new AjaxPromise(
        "/auth/register_device",
        "POST",
        _this.get("session.authToken"),
        { handle: handle, platform: platform }
      );
    }

    function platformCode() {
      // jshint ignore:line
      var platform;
      if (_this.isAndroid()) {
        platform = "fcm";
      } else if (window.device.platform === "iOS") {
        platform = "aps";
      } else if (window.device.platform === "windows") {
        platform = "wns";
      }
      return platform;
    }

    function processTappedNotification({ order_id, is_private, package_id }) {
      // jshint ignore:line
      const model = order_id ? "designation" : "item";
      const id = order_id ? order_id : package_id;
      const router = _this.get("routing");
      _this
        .get("store")
        .findRecord(model, id, {
          reload: true
        })
        .then(data => {
          _this.get("store").pushPayload(data);
          if (order_id) {
            is_private
              ? router.transitionTo("orders.staff_conversation", order_id)
              : router.transitionTo("orders.conversation", order_id);
          } else {
            router.transitionTo("items.staff_conversation", package_id);
          }
        });
    }

    document.addEventListener("deviceready", onDeviceReady, true);
  }
});
