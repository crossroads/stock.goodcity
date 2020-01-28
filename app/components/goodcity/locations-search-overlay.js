import Ember from "ember";
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
  store: Ember.inject.service(),
  perPage: 10,

  init() {
    this._super("location-search-overlay");
  },

  recentlyUsedLocations: Ember.computed("open", function() {
    return this.get("store")
      .peekAll("location")
      .sortBy("recentlyUsedAt")
      .slice(0, 10);
  }),

  showRecentlyUsed: Ember.computed.not("searchText"),

  headerText: Ember.computed.alias("options.headerText"),
  presetLocations: Ember.computed.alias("options.presetLocations"),

  actions: {
    cancel() {
      this.send("selectLocation", null);
      this.set("searchText", "");
    },

    async selectLocation(location) {
      const callback = this.getWithDefault("onSelect", _.noop);

      if (this.get("selectedLocation")) {
        this.get("selectedLocation")(location);
      }

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
