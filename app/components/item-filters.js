import Ember from "ember";
import _ from "lodash";

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
  i18n: Ember.inject.service(),
  filterService: Ember.inject.service(),
  publishFilter: "",
  imageFilter: "",
  availableStates: [
    { state: "in_stock", enabled: false },
    { state: "designated", enabled: false }
  ],
  lossStates: [
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
        lossStates,
        publishFilter,
        imageFilter
      } = itemFilters;
      this.set(
        "stateFilters",
        availableStates || _.cloneDeep(this.get("availableStates"))
      );
      this.set(
        "lossStateFilters",
        lossStates || _.cloneDeep(this.get("lossStates"))
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
          lossStates: this.get("lossStateFilters"),
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
          this.get("lossStateFilters")
        ];
        this.uncheckAll(allStatesFilters);
      }
    }
  }
});
