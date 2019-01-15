import Ember from "ember";

export default Ember.Service.extend({

  localStorage: Ember.inject.service(),

  getOrderStateFilters: Ember.computed(function() {
    return this.get('localStorage').read('orderStateFilters', []);
  }),

  getOrderTypeFilters: Ember.computed(function() {
    return this.get('localStorage').read('orderTypeFilters', []);
  }),

  getItemStateFilters: Ember.computed(function(){
    return this.get('localStorage').read('itemStateFilters', []);
  }),

  getItemLocationFilters: Ember.computed(function(){
    return this.get('localStorage').read('itemLocationFilters');
  }),

  isPriority() {
    if (this.get('getOrderStateFilters')) {
      return this.get('getOrderStateFilters').indexOf('showPriority') >= 0;
    }
  },

  setStateTypeFilter(states) {
    this.get('localStorage').write('orderStateFilters', states);
  },

  clearFilters() {
    this.get('localStorage').remove('orderStateFilters');
    this.get('localStorage').remove('orderTypeFilters');
  }

});
