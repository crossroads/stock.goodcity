import Ember from 'ember';
import config from '../config/environment';

export default Ember.Controller.extend({
  application: Ember.inject.controller(),
  filterService: Ember.inject.service(),

  stockAppVersion: Ember.computed(function(){
    return config.cordova.enabled ? config.APP.VERSION : null;
  }),

  isOrderFulfilmentUser: Ember.computed('session.currentUser', function() {
    let user = this.get('session.currentUser');
    return user.get('roleNames').indexOf('Order fulfilment') >= 0;
  }),

  actions: {
    logMeOut() {
      this.get('application').send('logMeOut');
    },

    goToOrder(states, priority= false) {
      let stateFilter = [states];
      if (priority) {
        stateFilter.unshift('showPriority');
      }
      this.get('filterService').clearFilters();
      this.get('filterService').setStateTypeFilter(stateFilter);
      this.transitionToRoute('orders', { queryParams: { isFiltered: true }});
    }

  }
});
