import Ember from "ember";
import _ from "lodash";
import SearchMixin from "stock/mixins/search_resource";

/**
 * An overlay that pops up from the bottom of the screen, allowing the user
 * to search and select an order.
 *
 * The popup *does not* do anythinng to the order apart from returning it
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
    this.set("uuid", _.uniqueId("orders_search_overlay_"));
  },

  noInput: Ember.computed.not("searchText"),

  showRecentlyUsed: Ember.computed.and("noInput", "open"),

  recentlyUsedOrders: Ember.computed("open", function() {
    return this.get("store")
      .peekAll("designation")
      .sortBy("recentlyUsedAt")
      .slice(0, 10);
  }),

  actions: {
    cancel() {
      this.send("selectOrder", null);
    },

    selectOrder(order) {
      this.getWithDefault("onSelect", _.noop)(order);
      this.set("open", false);
    },

    loadMoreOrders(pageNo) {
      const params = this.trimQuery(
        _.merge({}, this.getSearchQuery(), this.getPaginationQuery(pageNo))
      );

      return this.get("store").query("designation", params);
    }
  }
});
