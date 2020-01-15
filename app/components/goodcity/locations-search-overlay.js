import { not, alias } from "@ember/object/computed";
import { computed } from "@ember/object";
import { inject as service } from "@ember/service";
import _ from "lodash";
import SingletonComponent from "../base/global";
import SearchMixin from "stock/mixins/search_resource";
import { stagerred } from "../../utils/async";

/**
 * An overlay that pops up from the bottom of the screen, allowing the user
 * to search and select a location.
 *
 * The popup *does not* do anything to the location apart from returning it
 *
 * @property {boolean} open whether the popup is visible or not
 * @property {function} onSelect callback triggered when an order is selected
 */
export default SingletonComponent.extend(SearchMixin, {
  searchProps: {},
  autoLoad: true,
  store: service(),
  perPage: 10,

  init() {
    this._super("location-search-overlay");
  },

  recentlyUsedLocations: computed("open", function() {
    return this.get("store")
      .peekAll("location")
      .sortBy("recentlyUsedAt")
      .slice(0, 10);
  }),

  showRecentlyUsed: not("searchText"),

  headerText: alias("options.headerText"),
  presetLocations: alias("options.presetLocations"),

  actions: {
    cancel() {
      this.send("selectLocation", null);
      this.set("searchText", "");
    },

    async selectLocation(location) {
      const callback = this.getWithDefault("onSelect", _.noop);

      this.set("open", false);
      this.set("searchText", "");

      // Delay the return a little bit for the animation to start
      stagerred(location).then(callback);
    },

    loadMoreLocations(pageNo) {
      const params = this.trimQuery(
        _.merge({}, this.getSearchQuery(), this.getPaginationQuery(pageNo))
      );

      return this.get("store").query("location", params);
    }
  }
});
