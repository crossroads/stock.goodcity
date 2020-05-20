import config from "../../config/environment";
import Ember from "ember";
import _ from "lodash";
import SearchMixin from "stock/mixins/search_resource";

export default Ember.Controller.extend(SearchMixin, {
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

    setScannedSearchText(searchedText) {
      this.set("searchText", searchedText);
    },

    clearSearch() {
      this.set("searchText", "");
    }
  }
});
