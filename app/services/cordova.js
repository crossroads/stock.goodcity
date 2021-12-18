import Ember from 'ember';
import config from '../config/environment';
import AjaxPromise from '../utils/ajax-promise';

export default Ember.Service.extend({
  session: Ember.inject.service(),
  store: Ember.inject.service(),

  isAndroid() {
    if (!config.cordova.enabled || !window.device) {
      return;
    }
    return ['android', 'Android', 'amazon-fireos'].indexOf(window.device.platform) >= 0;
  },

  isIOSBrowser() {
    const userAgent = window.navigator.userAgent;
    return userAgent.match(/iPad/i) || userAgent.match(/iPhone/i);
  },

  isIOS() {
    if (!config.cordova.enabled || !window.device) {
      return;
    }
    return window.device.platform === 'iOS';
  },

  appLoad() {
    if (!config.cordova.enabled || config.disableNotifications) {
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
        android: {},
        ios: {
          alert: true,
          sound: true,
          badge: true,
        },
      });

      push.on('registration', function(data) {
        sendToken(data.registrationId, platformCode());
      });

      push.on('notification', function(data) {
        if (!data.additionalData.foreground) {
          if (window.device.platform === 'iOS') {
            processTappedNotification(data.additionalData.payload);
          } else {
            processTappedNotification(data.additionalData);
          }
        }
      });

      push.on('error', e => {
        console.log(e);
      });
    }

    function sendToken(handle, platform) {
      // jshint ignore:line
      return new AjaxPromise('/auth/register_device', 'POST', _this.get('session.authToken'), {
        handle: handle,
        platform: platform,
      });
    }

    function platformCode() {
      // jshint ignore:line
      var platform;
      if (_this.isAndroid()) {
        platform = 'fcm';
      } else if (window.device.platform === 'iOS') {
        platform = 'aps';
      }
      return platform;
    }

    function processTappedNotification({ messageable_type, is_private, messageable_id }) {
      // jshint ignore:line
      const model = messageable_type == 'Order' ? 'designation' : 'item';
      const router = _this.get('router');
      _this
        .get('store')
        .findRecord(model, messageable_id, {
          reload: true,
        })
        .then(data => {
          _this.get('store').pushPayload(data);
          if (messageable_type == 'Order') {
            is_private == 'True'
              ? router.transitionTo('orders.staff_conversation', messageable_id)
              : router.transitionTo('orders.conversation', messageable_id);
          } else {
            router.transitionTo('items.staff_conversation', messageable_id);
          }
        });
    }

    document.addEventListener('deviceready', onDeviceReady, true);
  },
});
