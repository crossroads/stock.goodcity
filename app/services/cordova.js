import { getOwner } from "@ember/application";
import Service, { inject as service } from "@ember/service";
import config from "../config/environment";
import AjaxPromise from "../utils/ajax-promise";

export default Service.extend({
  session: service(),
  store: service(),

  isAndroid() {
    if (!config.cordova.enabled || !window.device) {
      return;
    }
    return (
      ["android", "Android", "amazon-fireos"].indexOf(window.device.platform) >=
      0
    );
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

    function processTappedNotification(payload) {
      // jshint ignore:line
      var notifications = getOwner(_this).lookup("controller:notifications");

      new AjaxPromise(
        `/designations/${payload.order_id}`,
        "GET",
        _this.get("session.authToken")
      ).then(data => {
        _this.get("store").pushPayload(data);
        notifications.redirectToOrderDetail(payload.order_id);
      });
    }

    document.addEventListener("deviceready", onDeviceReady, true);
  }
});
