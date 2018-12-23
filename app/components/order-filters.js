import Ember from 'ember';

export default Ember.Component.extend({
  i18n: Ember.inject.service(),

  allOrderStateFilters: ["showPriority", "submitted", "processing", "awaiting_dispatch", "dispatching", "closed", "cancelled"],
  allOrderTypeFilters: ["appointment", "online_orders_ggv", "online_orders_pickup", "shipment"],

  //To separate out "showPriority" filter as it has some different css properties than others
  orderStateFilters: Ember.computed('allOrderStateFilters.[]', function() {
    return this.get("allOrderStateFilters").slice(1);
  }),

  //Marks filters as selected depending on pre-selected set of filters
  didInsertElement() {
    var checkedStateFilters = JSON.parse(window.localStorage.getItem('orderStateFilters'));
    var checkedTypeFilters = JSON.parse(window.localStorage.getItem('orderTypeFilters'));
    if(this.get("applyStateFilter") && checkedStateFilters && checkedStateFilters.length) {
      checkedStateFilters.forEach(checkedFilter => Ember.$("#" + checkedFilter)[0].checked = true); // jshint ignore:line
    } else if(this.get("applyTypeFilter") && checkedTypeFilters && checkedTypeFilters.length) {
      checkedTypeFilters.forEach(checkedFilter => Ember.$("#" + checkedFilter)[0].checked = true); // jshint ignore:line
    }
  },

  //Adds applied filters to localStorage as an array and redirects (Generic for all filters)
  addToLocalStorageAndRedirect(filterType, localStorageName) {
    let appliedFilters = [];
    filterType.forEach(state => {
      if(Ember.$(`#${state}`)[0].checked) {
        appliedFilters.push(state); // jshint ignore:line
      }
    });
    window.localStorage.setItem(localStorageName, JSON.stringify(appliedFilters));
    let storageName = "get" + localStorageName.charAt(0).capitalize() + localStorageName.slice(1);

    this.notifyFilterService(storageName);

    if (this.filterService.get('getOrderStateFilters').length || this.filterService.get('getOrderTypeFilters').length) {
      this.get('router').transitionTo("orders.index", { queryParams: {isFiltered: true}});
    } else {
      this.get('router').transitionTo("orders.index");
    }
  },

  //Removes applied filters (Generic for all filters)
  clearFiltersFromLocalStorage(filterType) {
    filterType.forEach(filter => Ember.$("#" + filter)[0].checked = false); // jshint ignore:line
  },

  notifyFilterService(serviceOrType) {
    this.filterService.notifyPropertyChange(serviceOrType);
  },

  actions: {
    applyFilters() {
      if(this.get("applyStateFilter")) {
        this.addToLocalStorageAndRedirect(this.get("allOrderStateFilters"), "orderStateFilters");
        this.notifyFilterService("getOrderStateFilters");
      } else if(this.get("applyTypeFilter")) {
        this.addToLocalStorageAndRedirect(this.get("allOrderTypeFilters"), "orderTypeFilters");
        this.notifyFilterService("getOrderTypeFilters");
      }
    },

    clearFilters() {
      if(this.get("applyStateFilter")) {
        this.clearFiltersFromLocalStorage(this.get("allOrderStateFilters"));
      } else if(this.get("applyTypeFilter")) {
        this.clearFiltersFromLocalStorage(this.get("allOrderTypeFilters"));
      }
    }
  }
});
