import Ember from "ember";

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

function isChecked(filter) {
  return Ember.$(`#${filter}`)[0].checked;
}

// ---Component

export default Ember.Component.extend({
  intl: Ember.inject.service(),
  filterService: Ember.inject.service(),
  stateFilters: ["in_stock", "designated", "dispatched"],
  publishFilters: ["published_and_private", "published", "private"],
  imageFilters: ["with_and_without_images", "has_images", "no_images"],

  //Marks filters as selected depending on pre-selected set of filters
  didInsertElement() {
    if (this.get("applyStateFilter")) {
      this.get("filterService.itemStateFilters").forEach(checkFilter);
    }
  },

  // Adds applied filters to localStorage as an array and redirects
  applyFilter(filters, name) {
    let filterService = this.get("filterService");
    let appliedFilters = filters.filter(isChecked);

    filterService.set(name, appliedFilters);
    this.get("router").transitionTo("items.index");
  },

  // Removes applied filters (Generic for all filters)
  uncheckAll(filters) {
    filters.forEach(uncheckFilter);
  },

  actions: {
    applyFilters() {
      if (this.get("applyStateFilter")) {
        let allStatesFilters = this.get("stateFilters")
          .concat(this.get("publishFilters"))
          .concat(this.get("imageFilters"));
        this.applyFilter(allStatesFilters, "itemStateFilters");
      }
    },

    clearFilters() {
      if (this.get("applyStateFilter")) {
        let allStatesFilters = this.get("stateFilters")
          .concat(this.get("publishFilters"))
          .concat(this.get("imageFilters"));
        this.uncheckAll(allStatesFilters);
      }
    }
  }
});
