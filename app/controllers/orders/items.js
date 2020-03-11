import config from "../../config/environment";
import Ember from "ember";
import _ from "lodash";
import SearchMixin from "stock/mixins/search_resource";

export default Ember.Controller.extend(SearchMixin, {
  queryParams: ["searchInput"],
  hideDetailsLink: true,
  settings: Ember.inject.service(),

  orderId: Ember.computed.alias("model.id"),
  isMobileApp: config.cordova.enabled,
  autoDisplayOverlay: false,

  autoLoad: false,
  perPage: 25,

  getFilterQuery() {
    return {
      stockRequest: true,
      restrictMultiQuantity: this.get("settings.onlyDesignateSingletons")
    };
  },

  scannedItemWatcher: Ember.observer("searchInput", function() {
    const searchInput = this.get("searchInput") || "";
    const sanitizedString = this.sanitizeString(searchInput);
    if (sanitizedString) {
      this.set("searchText", sanitizedString);
    }
  }),

  scannedText: Ember.observer("searchText", function() {
    const searchValue = this.get("searchText") || "";
    this.set("searchInput", this.sanitizeString(searchValue));
  }),

  triggerDisplayDesignateOverlay() {
    this.set("autoDisplayOverlay", true);
  },

  actions: {
    loadMoreItems(pageNo) {
      const params = this.trimQuery(
        _.merge(
          {},
          this.getFilterQuery(),
          this.getSearchQuery(),
          this.getPaginationQuery(pageNo)
        )
      );

      return this.get("store")
        .query("item", params)
        .then(results => {
          return results;
        });
    },

    clearSearch() {
      this.set("searchText", "");
    },

    displaySetItems(item) {
      this.set("itemSetId", item.get("itemId"));
      Ember.run.debounce(this, this.applyFilter, 0);
    }
  }
});
