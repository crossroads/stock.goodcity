import Ember from "ember";
import _ from "lodash";

// ---Component

export default Ember.Component.extend({
  i18n: Ember.inject.service(),
  filterService: Ember.inject.service(),
  publishFilter: "",
  imageFilter: "",
  availableStates: [
    { state: "in_stock", enabled: false },
    { state: "designated", enabled: false }
  ],
  inventoryStates: [
    { state: "dispatched", enabled: false },
    { state: "process", enabled: false },
    { state: "loss", enabled: false },
    { state: "pack", enabled: false },
    { state: "trash", enabled: false },
    { state: "recycle", enabled: false }
  ],
  publishFilters: ["published_and_private", "published", "private"],
  imageFilters: ["with_and_without_images", "has_images", "no_images"],

  //Marks filters as selected depending on pre-selected set of filters
  didInsertElement() {
    const itemFilters = this.get("filterService.itemStateFilters");
    if (this.get("applyStateFilter")) {
      const {
        availableStates,
        inventoryStates,
        publishFilter,
        imageFilter
      } = itemFilters;
      this.set(
        "stateFilters",
        availableStates || _.cloneDeep(this.get("availableStates"))
      );
      this.set(
        "inventoryFilters",
        inventoryStates || _.cloneDeep(this.get("inventoryStates"))
      );
      this.set("publishFilter", publishFilter);
      this.set("imageFilter", imageFilter);
    }
  },

  // Removes applied filters (Generic for all filters)
  uncheckAll(filters) {
    return filters.forEach(filter => {
      filter.forEach(state => Ember.set(state, "enabled", false));
    });
  },

  // Applies filters (Generic for all given filters)
  checkAll(filters) {
    return filters.forEach(filter => {
      filter.forEach(state => Ember.set(state, "enabled", true));
    });
  },

  actions: {
    applyFilters() {
      if (this.get("applyStateFilter")) {
        let filterService = this.get("filterService");
        let allStatesFilters = {
          availableStates: this.get("stateFilters"),
          inventoryStates: this.get("inventoryFilters"),
          publishFilter: this.get("publishFilter"),
          imageFilter: this.get("imageFilter")
        };
        filterService.set("itemStateFilters", allStatesFilters);
        this.get("router").transitionTo("items.index");
      }
    },

    applyOnHandFilter() {
      if (this.get("applyStateFilter")) {
        this.send("clearFilters");
        this.checkAll([this.get("stateFilters")]);
        this.send("applyFilters");
      }
    },

    clearFilters() {
      if (this.get("applyStateFilter")) {
        let allStatesFilters = [
          this.get("stateFilters"),
          this.get("inventoryFilters")
        ];
        this.set("publishFilter", ""),
          this.set("imageFilter", ""),
          this.uncheckAll(allStatesFilters);
      }
    },

    toggleCheckbox(state) {
      Ember.set(state, "enabled", !state.enabled);
    }
  }
});
