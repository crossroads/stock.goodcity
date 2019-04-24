import Ember from "ember";
import _ from "lodash";

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

function startOfDay(date) {
  return moment(date)
    .startOf("day")
    .toDate();
}

function endOfDay(date) {
  return moment(date)
    .endOf("day")
    .toDate();
}

const STATE = "state";
const TYPE = "type";
const TIME = "time";
const UNKNOWN = "unknown";

// --- Component

export default Ember.Component.extend({
  i18n: Ember.inject.service(),
  filterService: Ember.inject.service(),

  selectedTimeRange: {
    preset: "",
    after: null,
    before: null
  },

  presetTimeKeys: Ember.computed(function() {
    return _.keys(this.get("filterService.orderTimeRangePresets"));
  }),

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

  filterContext: Ember.computed(
    "applyStateFilter",
    "applyTimeFilter",
    "applyTypeFilter",
    function() {
      if (this.get("applyStateFilter")) {
        return STATE;
      }
      if (this.get("applyTypeFilter")) {
        return TYPE;
      }
      if (this.get("applyTimeFilter")) {
        return TIME;
      }
      return UNKNOWN;
    }
  ),

  // Marks filters as selected depending on pre-selected set of filters
  didInsertElement() {
    const service = this.get("filterService");
    const context = this.get("filterContext");

    switch (context) {
      case TYPE:
        return service.get("orderStateFilters").forEach(checkFilter);
      case STATE:
        return service.get("orderStateFilters").forEach(checkFilter);
      case TIME:
        const { preset, after, before } = service.get("orderTimeRange");
        return this.set("selectedTimeRange", {
          preset,
          after: preset ? null : after,
          before: preset ? null : before
        });
    }
  },

  // Adds applied filters to localStorage as an array and redirects
  applyFilter(filters, name) {
    let filterService = this.get("filterService");
    let appliedFilters = filters.filter(isChecked);
    filterService.set(name, appliedFilters);
    this.navigateAway();
  },

  navigateAway() {
    this.get("router").transitionTo("orders.index");
  },

  uncheckAll(filterType) {
    this.get(filterType).forEach(uncheckFilter);
  },

  applyTimeFilters() {
    const { preset, after, before } = this.get("selectedTimeRange");
    this.get("filterService").setOrderTimeRange(preset || { after, before });
    this.navigateAway();
  },

  actions: {
    applyFilters() {
      if (this.get("applyStateFilter")) {
        return this.applyFilter(
          this.get("allOrderStateFilters"),
          "orderStateFilters"
        );
      }

      if (this.get("applyTypeFilter")) {
        return this.applyFilter(
          this.get("allOrderTypeFilters"),
          "orderTypeFilters"
        );
      }

      if (this.get("applyTimeFilter")) {
        return this.applyTimeFilters();
      }
    },

    clearFilters() {
      if (this.get("applyStateFilter")) {
        return this.uncheckAll("allOrderStateFilters");
      }

      if (this.get("applyTypeFilter")) {
        return this.uncheckAll("allOrderTypeFilters");
      }

      if (this.get("applyTimeFilter")) {
        this.clearTimeFilters();
      }
    },

    clearTimeFilters() {
      this.set("selectedTimeRange.preset", null);
      this.set("selectedTimeRange.before", null);
      this.set("selectedTimeRange.after", null);
    },

    selectTimePreset(presetKey) {
      this.clearTimeFilters();
      this.set("selectedTimeRange.preset", presetKey);
    },

    setBeforeTime(before) {
      this._setRangeProperty("before", endOfDay(before));
    },

    setAfterTime(after) {
      this._setRangeProperty("after", startOfDay(after));
    },

    _setRangeProperty(prop, date) {
      this.set("selectedTimeRange.preset", null);
      this.set(`selectedTimeRange.${prop}`, date);
    }
  }
});
