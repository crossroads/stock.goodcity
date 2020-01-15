import { computed } from "@ember/object";
import { inject as service } from "@ember/service";
import Component from "@ember/component";
import $ from "jquery";
import _ from "lodash";
import { TYPE_FILTERS, STATE_FILTERS } from "../services/filter-service";

// --- Helpers

function setFilter(filter, val) {
  $(`#${filter}`)[0].checked = val;
}

function checkFilter(filter) {
  setFilter(filter, true);
}

function uncheckFilter(filter) {
  setFilter(filter, false);
}

function isChecked(filter) {
  return $(`#${filter}`)[0].checked;
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

export default Component.extend({
  i18n: service(),
  filterService: service(),

  selectedTimeRange: {
    preset: "",
    after: null,
    before: null
  },

  presetTimeKeys: computed(function() {
    return _.keys(this.get("filterService.orderTimeRangePresets"));
  }),

  allOrderStateFilters: computed(function() {
    return _.values(STATE_FILTERS);
  }),

  allOrderTypeFilters: computed(function() {
    return _.values(TYPE_FILTERS);
  }),

  orderStateFilters: computed("allOrderStateFilters.[]", function() {
    // Separate out "showPriority" filter as it has some different css properties than others
    return _.without(this.get("allOrderStateFilters"), STATE_FILTERS.PRIORITY);
  }),

  filterContext: computed(
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
        return service.get("orderTypeFilters").forEach(checkFilter);
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

  clearTimeFilters() {
    this.set("selectedTimeRange.preset", null);
    this.set("selectedTimeRange.before", null);
    this.set("selectedTimeRange.after", null);
  },

  _setRangeProperty(prop, date) {
    this.set("selectedTimeRange.preset", null);
    this.set(`selectedTimeRange.${prop}`, date);
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

    selectTimePreset(presetKey) {
      this.clearTimeFilters();
      this.set("selectedTimeRange.preset", presetKey);
    },

    setBeforeTime(before) {
      this._setRangeProperty("before", endOfDay(before));
    },

    setAfterTime(after) {
      this._setRangeProperty("after", startOfDay(after));
    }
  }
});
