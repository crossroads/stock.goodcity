import Ember from "ember";
import _ from "lodash";
import config from "stock/config/environment";
import SearchMixin from "stock/mixins/search_resource";
import AsyncMixin from "stock/mixins/async";

export default Ember.Component.extend(SearchMixin, AsyncMixin, {
  searchText: "",
  autoLoad: true,
  store: Ember.inject.service(),
  displayResults: false,
  perPage: 10,
  isMobileApp: config.cordova.enabled,
  packageService: Ember.inject.service(),
  messageBox: Ember.inject.service(),
  i18n: Ember.inject.service(),

  storageTypeName: Ember.computed.alias("entity.storageTypeName"),

  hasSearchText: Ember.computed("searchText", function() {
    return !!this.get("searchText");
  }),

  addSingleton(item) {
    let itemLocations = item.get("locations");
    const params = {
      item_id: item.id,
      task: "pack",
      location_id: itemLocations.get("lastObject").id,
      quantity: item.get("onHandQuantity")
    };

    this.runTask(() => {
      this.get("packageService")
        .addRemoveItem(this.get("entity.id"), params)
        .then(data => {
          this.sendAction("onSingletonAdd");
          this.closeOverlay();
        });
    });
  },

  closeOverlay() {
    this.setProperties({
      searchText: "",
      open: false,
      displayResults: false
    });
  },

  actions: {
    cancel() {
      this.closeOverlay();
    },

    setScannedSearchText(searchedText) {
      this.set("searchText", searchedText);
    },

    selectItem(item) {
      if (item.get("onHandQuantity") === 1) {
        return this.addSingleton(item);
      }
      this.get("onConfirm")(item);
      this.closeOverlay();
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
            storage_type_name: this.get("storageTypeName") || "Package"
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
