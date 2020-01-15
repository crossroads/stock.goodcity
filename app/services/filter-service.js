import Evented from "@ember/object/evented";
import Service, { inject as service } from "@ember/service";
import { computed } from "@ember/object";
import _ from "lodash";
import timeRanges from "../utils/time-ranges";

// --- Helpers

const PERSISTENT_VAR = function(propName, defaultValue, deserializeMap = {}) {
  return computed({
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
  ONLINE_ORDER: "online_orders",
  SHIPMENT: "shipment"
};

// --- Service

export default Service.extend(Evented, {
  localStorage: service(),

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

  hasOrderFilters: computed(
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

  orderTimeRangePresets: computed(function() {
    return timeRanges;
  }).volatile(),

  /**
   * Saves the time range filter for order search
   *
   * @param {String|Object} range A time range OR a preset name
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
   * @param {String|Object} range A time range OR a preset name
   */
  orderTimeRange: computed(function() {
    const { preset = "", after = null, before = null } = this.get(
      "_orderTimeSettings"
    );

    if (preset) {
      return _.extend({ preset }, this.get(`orderTimeRangePresets.${preset}`));
    }
    return { preset, after, before };
  }).volatile()
});
