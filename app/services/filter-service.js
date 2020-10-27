import Ember from "ember";
import _ from "lodash";
import timeRanges from "../utils/time-ranges";

// --- Helpers

const PERSISTENT_VAR = function(propName, defaultValue, deserializeMap = {}) {
  return Ember.computed({
    get() {
      const data = this.get("localStorage").read(propName, defaultValue);
      for (let key in deserializeMap) {
        if (data[key]) {
          data[key] = deserializeMap[key](data[key]);
        }
      }
      return data;
    },
    set(k, value) {
      this.get("localStorage").write(propName, value);
      this.trigger("change");
      return value;
    }
  });
};

// @TODO: priority should not be a state filter
export const STATE_FILTERS = {
  PRIORITY: "showPriority",
  SUBMITTED: "submitted",
  PROCESSING: "processing",
  SCHEDULED: "awaiting_dispatch",
  DISPATCHING: "dispatching",
  CLOSED: "closed",
  CANCELLED: "cancelled"
};

export const TYPE_FILTERS = {
  APPOINTMENT: "appointment",
  ONLINE_ORDER: "online_order",
  SHIPMENT: "shipment"
};

// --- Service

/**
 * Filter service
 *
 * @module Services/FilterService
 * @augments ember/Services
 * @description Controls local data related to list filtering
 */
export default Ember.Service.extend(Ember.Evented, {
  localStorage: Ember.inject.service(),

  orderStateFilters: PERSISTENT_VAR("orderStateFilters", []),

  orderTypeFilters: PERSISTENT_VAR("orderTypeFilters", []),

  itemStateFilters: PERSISTENT_VAR("itemStateFilters", []),

  itemLocationFilters: PERSISTENT_VAR("itemLocationFilters", ""),

  isPriority() {
    const filters = this.get("orderStateFilters");
    return filters && filters.indexOf(STATE_FILTERS.PRIORITY) >= 0;
  },

  clearItemLocationFilters() {
    this.set("itemLocationFilters", "");
  },

  clearItemStateFilters() {
    this.set("itemStateFilters", []);
  },

  clearOrderStateFilters() {
    this.set("orderStateFilters", []);
  },

  clearOrderTypeFilters() {
    this.set("orderTypeFilters", []);
  },

  clearOrderTimeFilters() {
    this.setOrderTimeRange(null);
  },

  clearFilters() {
    this.clearOrderStateFilters();
    this.clearOrderTypeFilters();
    this.clearOrderTimeFilters();
  },

  itemStateFilterArray: Ember.computed("itemStateFilters", function() {
    const itemFilters = this.get("itemStateFilters");
    return _.chain(itemFilters)
      .map(f =>
        _.isArray(f)
          ? _.filter(f, ["enabled", true]).map(({ state }) => state)
          : f
      )
      .compact()
      .flatten()
      .value();
  }),

  hasOrderFilters: Ember.computed(
    "orderStateFilters",
    "orderTypeFilters",
    "_orderTimeSettings",
    function() {
      const timeRange = this.get("orderTimeRange");
      return (
        this.get("orderStateFilters").length > 0 ||
        this.get("orderTypeFilters").length > 0 ||
        timeRange.after ||
        timeRange.before
      );
    }
  ),

  // --- Order time filters

  _orderTimeSettings: PERSISTENT_VAR(
    "orderTimeSettings",
    {},
    {
      after: raw => new Date(raw),
      before: raw => new Date(raw)
    }
  ),

  orderTimeRangePresets: Ember.computed(function() {
    return timeRanges;
  }).volatile(),

  /**
   * Saves the time range filter for order search
   *
   * @param {String|Object} range A time range OR a preset name
   * @memberof FilterService
   */
  setOrderTimeRange(range) {
    if (_.isString(range)) {
      const preset = range;
      this.set("_orderTimeSettings", { preset });
    } else {
      this.set("_orderTimeSettings", {
        preset: null,
        after: _.get(range, "after"),
        before: _.get(range, "before")
      });
    }

    this.notifyPropertyChange("orderTimeRange");
  },

  /**
   * Returns the order time range filter
   * If a preset was previously selected, it will be re-computed based
   * on the current time.
   *
   * @property {String|Object} range A time range OR a preset name
   */
  orderTimeRange: Ember.computed(function() {
    const { preset = "", after = null, before = null } = this.get(
      "_orderTimeSettings"
    );

    if (preset) {
      return _.extend({ preset }, this.get(`orderTimeRangePresets.${preset}`));
    }
    return { preset, after, before };
  }).volatile()
});
