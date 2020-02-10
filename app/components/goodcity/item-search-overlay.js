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
    this.set("displayResults", true);
  },

  hasSearchText: Ember.computed("searchText", function() {
    return !!this.get("searchText");
  }),

  actions: {
    cancel() {
      this.set("searchText", "");
      this.set("open", false);
    },

    selectItem(item) {
      this.set("open", false);
      this.get("onConfirm")(item);
    },

    clearSearch() {
      this.set("searchText", "");
    },

    async loadMoreItems(pageNo) {
      const params = this.trimQuery(
        _.merge(
          {},
          this.getSearchQuery(true),
          this.getPaginationQuery(pageNo),
          {
            associated_package_types: this.get("associatedPackageTypes"),
            withInventoryNumber: true
          }
        )
      );
      let items = await this.get("store").query("item", params);
      return items.filter(function(item) {
        return item.get("inHandQuantity") > 0;
      });
    }
  }
});