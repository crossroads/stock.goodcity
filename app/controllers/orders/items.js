import config from "../../config/environment";
import Ember from "ember";
import _ from "lodash";
import SearchMixin from "../../mixins/search_resource";

export default Ember.Controller.extend(SearchMixin, {
  queryParams: ["searchInput"],
  hideDetailsLink: true,

  orderId: Ember.computed.alias("model.id"),
  isMobileApp: config.cordova.enabled,
  autoDisplayOverlay: false,
  isPreloadable: false,

  getFilterQuery() {
    return {
      stockRequest: true,
      restrictMultiQuantity: true
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

    displaySetItems(item) {
      this.set("itemSetId", item.get("itemId"));
      Ember.run.debounce(this, this.applyFilter, 0);
    }
  }
});
