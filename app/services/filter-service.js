import Ember from "ember";

// --- Helpers

const PERSISTENT_VAR = function(propName, defaultValue) {
  return Ember.computed({
    get() {
      return this.get("localStorage").read(propName, defaultValue);
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

  orderTimeFilters: PERSISTENT_VAR("orderTimeFilters", []),

  itemStateFilters: PERSISTENT_VAR("itemStateFilters", []),

  itemLocationFilters: PERSISTENT_VAR("itemLocationFilters", ""),

  isPriority() {
    const filters = this.get("orderStateFilters");
    return filters && filters.indexOf("showPriority") >= 0;
  },

  clearFilters() {
    this.set("orderStateFilters", []);
    this.set("orderTypeFilters", []);
  }
});
