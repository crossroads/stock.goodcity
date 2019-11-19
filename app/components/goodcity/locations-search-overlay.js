import Ember from "ember";
import _ from "lodash";
import SearchMixin from "stock/mixins/search_resource";

/**
 * An overlay that pops up from the bottom of the screen, allowing the user
 * to search and select a location.
 *
 * The popup *does not* do anything to the location apart from returning it
 *
 * @property {boolean} open whether the popup is visible or not
 * @property {function} onSelect callback triggered when an order is selected
 */
export default Ember.Component.extend(SearchMixin, {
  searchProps: {},
  autoLoad: true,
  store: Ember.inject.service(),
  perPage: 10,

  init() {
    this._super(...arguments);
    this.set("uuid", _.uniqueId("location_search_overlay_"));
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

    selectLocation(location) {
      this.getWithDefault("onSelect", _.noop)(location);
      this.set("open", false);
      this.set("searchText", "");
    },

    loadMoreLocations(pageNo) {
      const params = this.trimQuery(
        _.merge({}, this.getSearchQuery(), this.getPaginationQuery(pageNo))
      );

      return this.get("store").query("location", params);
    }
  }
});
