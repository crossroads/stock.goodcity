import Ember from "ember";
import config from '../config/environment';

export default Ember.Service.extend({

  getOrderStateFilters() {
    return JSON.parse(window.localStorage.getItem('orderStateFilters'));
  },

  getOrderTypeFilters() {
    return JSON.parse(window.localStorage.getItem('orderTypeFilters'));
  },

  isPriority() {
    return this.getOrderStateFilters().indexOf('showPriority') >= 0;
  },

  setStateTypeFilter(states) {
    window.localStorage.setItem('orderStateFilters', JSON.stringify(states));
  },

  clearFilters() {
    window.localStorage.setItem('orderStateFilters', []);
  }

});
