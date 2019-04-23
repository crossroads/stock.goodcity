import Ember from "ember";
import _ from "lodash";

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
      return value;
    }
  });
};

// --- Service

export default Ember.Service.extend({
  localStorage: Ember.inject.service(),

  orderStateFilters: PERSISTENT_VAR("orderStateFilters", []),

  orderTypeFilters: PERSISTENT_VAR("orderTypeFilters", []),

  itemStateFilters: PERSISTENT_VAR("itemStateFilters", []),

  itemLocationFilters: PERSISTENT_VAR("itemLocationFilters", ""),

  isPriority() {
    const filters = this.get("orderStateFilters");
    return filters && filters.indexOf("showPriority") >= 0;
  },

  clearFilters() {
    this.set("orderStateFilters", []);
    this.set("orderTypeFilters", []);
    this.setOrderTimeRange(null);
  },

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
    return {
      overdue: {
        before: moment().toDate(),
        after: null
      },
      today: {
        after: moment()
          .startOf("day")
          .toDate(),
        before: moment()
          .endOf("day")
          .toDate()
      },
      tomorrow: {
        after: moment()
          .add(1, "days")
          .startOf("day")
          .toDate(),
        before: moment()
          .add(1, "days")
          .endOf("day")
          .toDate()
      },
      week: {
        after: moment()
          .startOf("week")
          .isoWeekday(2)
          .toDate(),
        before: moment()
          .endOf("week")
          .isoWeekday(2)
          .toDate()
      },
      next_week: {
        after: moment()
          .add(1, "weeks")
          .startOf("week")
          .isoWeekday(2)
          .toDate(),
        before: moment()
          .add(1, "weeks")
          .endOf("week")
          .isoWeekday(2)
          .toDate()
      },
      month: {
        after: moment()
          .startOf("month")
          .toDate(),
        before: moment()
          .endOf("month")
          .toDate()
      },
      next_month: {
        after: moment()
          .add(1, "months")
          .startOf("month")
          .toDate(),
        before: moment()
          .add(1, "months")
          .endOf("month")
          .toDate()
      }
    };
  }).volatile(),

  /**
   * Saves the time range filter for order search
   *
   * @param {String|Object} range A time range OR a preset name
   */
  setOrderTimeRange(range) {
    if (_.isString(range)) {
      const preset = range;
      return this.set("_orderTimeSettings", { preset });
    }

    return this.set("_orderTimeSettings", {
      preset: null,
      after: _.get(range, "after"),
      before: _.get(range, "before")
    });
  },

  /**
   * Returns the order time range filter
   * If a preset was previously selected, it will be re-computed based
   * on the current time.
   *
   * @param {String|Object} range A time range OR a preset name
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
