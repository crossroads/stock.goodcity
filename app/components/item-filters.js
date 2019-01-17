import Ember from 'ember';

// --HELPERS
function setFilter(filter, val) {
  Ember.$(`#${filter}`)[0].checked = val;
}

function checkFilter(filter) {
  setFilter(filter, true);
}

function uncheckFilter(filter) {
  setFilter(filter, false);
}

// ---Component

export default Ember.Component.extend({
  i18n: Ember.inject.service(),
  filterService: Ember.inject.service(),
  stateFilters: ["in_stock", "designated", "dispatched"],
  publishFilters: ["published_and_private", "published", "private"],
  imageFilters: ["with_and_without_images", "has_images", "no_images"],

  //Marks filters as selected depending on pre-selected set of filters
  didInsertElement() {
    if(this.get("applyStateFilter")) {
      this.filterService.get('getItemStateFilters').forEach(checkFilter);
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
    this.get('router').transitionTo("items.index");
  },

  //Removes applied filters (Generic for all filters)
  clearFiltersFromLocalStorage(filters) {
    filters.forEach(uncheckFilter); // jshint ignore:line
  },

  actions: {
    applyFilters() {
      if(JSON.parse(this.get("applyStateFilter"))) {
        let allStatesFilters = this.get("stateFilters").concat(this.get("publishFilters")).concat(this.get("imageFilters"));
        this.addToLocalStorageAndRedirect(allStatesFilters, "itemStateFilters");
        this.get('filterService').notifyPropertyChange("getItemStateFilters");
      }
    },

    clearFilters() {
      if(JSON.parse(this.get("applyStateFilter"))) {
        let allStatesFilters = this.get("stateFilters").concat(this.get("publishFilters")).concat(this.get("imageFilters"));
        this.clearFiltersFromLocalStorage(allStatesFilters);
      }
    }
  }
});
