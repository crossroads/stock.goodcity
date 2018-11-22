import Ember from 'ember';
import config from '../config/environment';

export default Ember.Controller.extend({

  subscription: Ember.inject.controller(),
  cordova: Ember.inject.service(),
  store: Ember.inject.service(),
  isMobileApp: config.cordova.enabled,

  initSubscription: Ember.on('init', function() {
    this.get('subscription').send('wire');
    if (this.get('isMobileApp') && cordova.platformId === "android") { // jshint ignore:line
      this.redirectToItem();
    }
  }),

  redirectToItem() {
    universalLinks.subscribe("redirectToItem", (eventData) => { // jshint ignore:line
      this.transitionToRoute(eventData.path);
    });
  },

  actions: {
    logMeOut() {
      this.session.clear(); // this should be first since it updates isLoggedIn status
      this.get('subscription').send('unwire');
      this.get('subscription').send('unloadNotifications');
      this.get('store').unloadAll();
      this.transitionToRoute('login');
    }
  }
});
