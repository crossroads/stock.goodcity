import Ember from "ember";
import _ from "lodash";
// import config from "stock/config/environment";
import SearchMixin from "stock/mixins/search_resource";

export default Ember.Component.extend(SearchMixin, {
  searchText: "",
  autoLoad: true,
  store: Ember.inject.service(),
  // isMobileApp: config.cordova.enabled,
  perPage: 10,

  init() {
    this._super("item-search-overlay");
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
            withInventoryNumber: true,
            filter_box_pallet: true
          }
        )
      );
      let items = await this.get("store").query("item", params);
      return items.filter(
        item => item.get("onHandQuantity") && !item.get("isDispatched")
      );
    }
  }
});
