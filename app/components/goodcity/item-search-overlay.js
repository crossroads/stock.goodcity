import Ember from "ember";
import _ from "lodash";
import SearchMixin from "stock/mixins/search_resource";

export default Ember.Component.extend(SearchMixin, {
  searchText: "",
  autoLoad: true,
  store: Ember.inject.service(),
  perPage: 10,

  init() {
    this._super(...arguments);
    this._super("item-search-overlay");
    this.set("uuid", _.uniqueId("item_search_overlay_"));
  },

  noInput: Ember.computed.not("searchText"),

  actions: {
    cancel() {
      this.set("searchText", "");
      this.set("open", false);
    },

    selectItem(item) {
      this.set("open", false);
      this.get("onConfirm")(item);
    },

    loadMoreItems(pageNo) {
      const params = this.trimQuery(
        _.merge({}, this.getSearchQuery(true), this.getPaginationQuery(pageNo))
      );

      return this.get("store").query("item", params);
    }
  }
});
