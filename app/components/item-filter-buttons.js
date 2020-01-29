import { computed } from "@ember/object";
import { alias } from "@ember/object/computed";
import { inject as service } from "@ember/service";
import Component from "@ember/component";
import _ from "lodash";

export default Component.extend({
  i18n: service(),
  filterService: service(),

  itemStateFilters: alias("filterService.itemStateFilters"),
  hasStateFilters: computed("itemStateFilters", function() {
    return this.get("itemStateFilters").length > 0;
  }),

  itemLocationFilters: alias("filterService.itemLocationFilters"),
  hasLocationFilters: computed("itemLocationFilters", function() {
    return !!this.get("itemLocationFilters");
  }),

  actions: {
    redirectTofilters(param) {
      const queryParams = { [param]: true };
      this.get("router").transitionTo("item_filters", { queryParams });
    },

    clearStateFilters() {
      this.get("filterService").clearItemStateFilters();
    },

    clearLocationFilters() {
      this.get("filterService").clearItemLocationFilters();
    }
  }
});
