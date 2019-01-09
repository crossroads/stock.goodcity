import Ember from 'ember';
import config from '../config/environment';

export default Ember.Controller.extend({
  application: Ember.inject.controller(),
  filterService: Ember.inject.service(),

  stockAppVersion: Ember.computed(function(){
    return config.cordova.enabled ? config.APP.VERSION : null;
  }),

  actions: {
    logMeOut() {
      this.get('application').send('logMeOut');
    },

    goToOrder(states, priority= false) {
      let filterService = this.get('filterService');
      let stateFilter = [states];
      if (priority) {
        stateFilter.unshift('showPriority');
      }
      filterService.clearFilters();
      filterService.setStateTypeFilter(stateFilter);
      filterService.notifyPropertyChange("getOrderStateFilters");
      filterService.notifyPropertyChange("getOrderTypeFilters");
      this.transitionToRoute('orders', { queryParams: { preload: true }});
    }

  }
});
