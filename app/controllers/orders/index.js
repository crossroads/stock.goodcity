import Ember from "ember";
import _ from "lodash";
import searchModule from "../search_module";
import { STATE_FILTERS } from "../../services/filter-service";

export default searchModule.extend({
  searchModelName: "designation",
  minSearchTextLength: 2,
  queryParams: ["preload"],
  modelPath: "filteredResults",
  unloadAll: false,

  afterSearch(designations) {
    this.get("store").query("order_transport", {
      order_ids: designations.mapBy("id").join(",")
    });
  },

  createFilterParams() {
    let utilities = this.get("utilityMethods");
    let filterService = this.get("filterService");
    let stateFilters = filterService.get("orderStateFilters");
    let isPriority = filterService.isPriority();
    if (isPriority) {
      stateFilters = _.without(stateFilters, STATE_FILTERS.PRIORITY);
    }
    let typesFilters = filterService.get("orderTypeFilters");
    let { after, before } = filterService.get("orderTimeRange");
    let params = _.extend({}, this._super(), {
      state: utilities.stringifyArray(stateFilters),
      type: utilities.stringifyArray(typesFilters),
      priority: isPriority
    });

    if (after) {
      params.after = after.getTime();
    }
    if (before) {
      params.before = before.getTime();
    }
    return params;
  }
});
