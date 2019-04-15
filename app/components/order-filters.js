import Ember from "ember";

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

  allOrderStateFilters: [
    "showPriority",
    "submitted",
    "processing",
    "awaiting_dispatch",
    "dispatching",
    "closed",
    "cancelled"
  ],
  allOrderTypeFilters: ["appointment", "online_orders", "shipment"],

  // To separate out "showPriority" filter as it has some different css properties than others
  orderStateFilters: Ember.computed("allOrderStateFilters.[]", function() {
    return this.get("allOrderStateFilters").slice(1);
  }),

  // Marks filters as selected depending on pre-selected set of filters
  didInsertElement() {
    if (this.get("applyStateFilter")) {
      this.get("filterService.orderStateFilters").forEach(checkFilter);
    } else if (this.get("applyTypeFilter")) {
      this.get("filterService.orderTypeFilters").forEach(checkFilter);
    }
  },

  // Adds applied filters to localStorage as an array and redirects
  applyFilter(filters, name) {
    let filterService = this.get("filterService");
    let appliedFilters = filters.filter(isChecked);
    filterService.set(name, appliedFilters);
    this.get("router").transitionTo("orders.index");
  },

  uncheckAll(filterType) {
    this.get(filterType).forEach(uncheckFilter);
  },

  actions: {
    applyFilters() {
      if (this.get("applyStateFilter")) {
        this.applyFilter(this.get("allOrderStateFilters"), "orderStateFilters");
      } else if (this.get("applyTypeFilter")) {
        this.applyFilter(this.get("allOrderTypeFilters"), "orderTypeFilters");
      }
    },

    clearFilters() {
      if (this.get("applyStateFilter")) {
        this.uncheckAll("allOrderStateFilters");
      } else if (this.get("applyTypeFilter")) {
        this.uncheckAll("allOrderTypeFilters");
      }
    }
  }
});
