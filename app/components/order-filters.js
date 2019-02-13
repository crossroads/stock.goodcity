import Ember from 'ember';

// --- Helpers

function setFilter(filter, val) {
  Ember.$(`#${filter}`)[0].checked = val;
}

function checkFilter(filter) {
  setFilter(filter, true);
}

function uncheckFilter(filter) {
  setFilter(filter, false);
}

function isChecked(filter) {
  return Ember.$(`#${filter}`)[0].checked;
}

// --- Component

export default Ember.Component.extend({
  i18n: Ember.inject.service(),
  filterService: Ember.inject.service(),

  allOrderStateFilters: ["showPriority", "submitted", "processing", "awaiting_dispatch", "dispatching", "closed", "cancelled"],
  allOrderTypeFilters: ["appointment", "online_orders", "shipment"],

  // To separate out "showPriority" filter as it has some different css properties than others
  orderStateFilters: Ember.computed('allOrderStateFilters.[]', function() {
    return this.get("allOrderStateFilters").slice(1);
  }),

  // Marks filters as selected depending on pre-selected set of filters
  didInsertElement() {
    if (this.get("applyStateFilter")) {
      this.filterService.get('getOrderStateFilters').forEach(checkFilter); // jshint ignore:line
    } else if(this.get("applyTypeFilter")) {
      this.filterService.get('getOrderTypeFilters').forEach(checkFilter); // jshint ignore:line
    }
  },

  // Adds applied filters to localStorage as an array and redirects (Generic for all filters)
  addToLocalStorageAndRedirect(filterTypes, localStorageName) {
    let appliedFilters = filterTypes.filter(isChecked);
    let storageName = "get" + localStorageName.charAt(0).capitalize() + localStorageName.slice(1);

    window.localStorage.setItem(localStorageName, JSON.stringify(appliedFilters));

    this.notifyFilterService(storageName);

    this.get('router').transitionTo("orders.index");
  },

  // Removes applied filters (Generic for all filters)
  clearFiltersFromLocalStorage(filterType) {
    filterType.forEach(uncheckFilter); // jshint ignore:line
  },

  notifyFilterService(serviceOrType) {
    this.filterService.notifyPropertyChange(serviceOrType);
  },

  actions: {
    applyFilters() {
      if (this.get("applyStateFilter")) {
        this.addToLocalStorageAndRedirect(this.get("allOrderStateFilters"), "orderStateFilters");
        this.notifyFilterService("getOrderStateFilters");
      } else if (this.get("applyTypeFilter")) {
        this.addToLocalStorageAndRedirect(this.get("allOrderTypeFilters"), "orderTypeFilters");
        this.notifyFilterService("getOrderTypeFilters");
      }
    },

    clearFilters() {
      if (this.get("applyStateFilter")) {
        this.clearFiltersFromLocalStorage(this.get("allOrderStateFilters"));
      } else if (this.get("applyTypeFilter")) {
        this.clearFiltersFromLocalStorage(this.get("allOrderTypeFilters"));
      }
    }
  }
});
