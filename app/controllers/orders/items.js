import { debounce } from "@ember/runloop";
import { alias } from "@ember/object/computed";
import { inject as service } from "@ember/service";
import Controller from "@ember/controller";
import config from "../../config/environment";
import _ from "lodash";
import SearchMixin from "stock/mixins/search_resource";

export default Controller.extend(SearchMixin, {
  queryParams: ["searchInput"],
  hideDetailsLink: true,
  settings: service(),

  orderId: alias("model.id"),
  isMobileApp: config.cordova.enabled,
  autoDisplayOverlay: false,

  /**
   * @type {Boolean}, expected in SearchMixin
   **/
  autoLoad: false,
  /**
   * @type {Number}, perPage in response
   **/
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

    displaySetItems(item) {
      this.set("itemSetId", item.get("itemId"));
      debounce(this, this.applyFilter, 0);
    }
  }
});
