import Ember from "ember";
import _ from "lodash";
import SearchMixin from "stock/mixins/search_resource";

export default Ember.Component.extend(SearchMixin, {
  searchProps: {},
  autoLoad: true,
  store: Ember.inject.service(),
  perPage: 10,

  init() {
    this._super(...arguments);
    this.set("uuid", _.uniqueId("orders_search_overlay_"));
  },

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
