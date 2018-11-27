import Ember from 'ember';
import config from '../config/environment';

export default Ember.Controller.extend({
  application: Ember.inject.controller(),
  isOrderFulfilmentUser: true,

  stockAppVersion: Ember.computed(function(){
    return config.cordova.enabled ? config.APP.VERSION : null;
  }),

  actions: {
    logMeOut() {
      this.get('application').send('logMeOut');
    },

    gotOrder(filterType, priority='') {
      let filterList = [];
      if (priority) {
        filterList.push(priority);
      }
      filterList.push(filterType)
      window.localStorage.setItem('orderStateFilters', JSON.stringify([]));
      window.localStorage.setItem('orderStateFilters', JSON.stringify(filterList));
      this.transitionToRoute('orders');
    }

  }
});
