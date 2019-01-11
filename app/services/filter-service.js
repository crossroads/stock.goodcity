import Ember from "ember";

export default Ember.Service.extend({

  getOrderStateFilters: Ember.computed(function() {
    return JSON.parse(window.localStorage.getItem('orderStateFilters'));
  }),

  getOrderTypeFilters: Ember.computed(function() {
    return JSON.parse(window.localStorage.getItem('orderTypeFilters'));
  }),

  getItemStateFilters: Ember.computed(function(){
    return JSON.parse(window.localStorage.getItem('itemStateFilters'));
  }),

  getItemLocationFilters: Ember.computed(function(){
    return window.localStorage.getItem('itemLocationFilters');
  }),

  isPriority() {
    if (this.get('getOrderStateFilters')) {
      return this.get('getOrderStateFilters').indexOf('showPriority') >= 0;
    }
  },

  setStateTypeFilter(states) {
    window.localStorage.setItem('orderStateFilters', JSON.stringify(states));
  },

  clearFilters() {
    window.localStorage.removeItem('orderStateFilters');
    window.localStorage.removeItem('orderTypeFilters');
  }

});
