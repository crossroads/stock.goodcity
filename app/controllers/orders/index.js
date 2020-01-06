import Ember from "ember";
import _ from "lodash";
import { STATE_FILTERS } from "../../services/filter-service";
import SearchMixin from "stock/mixins/search_resource";

/**
 * @module Controllers/orders/OrdersSearchController
 * @augments ember/Controller
 */
export default Ember.Controller.extend(SearchMixin, {
  /**
   * @property {Boolean} SearchMixin configuration
   **/
  autoLoad: true,
  /**
   * @property {Number} SearchMixin configuration, perPage in response
   **/
  perPage: 25,

  afterSearch(designations) {
    if (designations && designations.get("length") > 0) {
      this.get("store").query("order_transport", {
        order_ids: designations.mapBy("id").join(",")
      });
    }
  },

  getFilterQuery() {
    const filterService = this.get("filterService");
    const utils = this.get("utilityMethods");

    let { after, before } = filterService.get("orderTimeRange");
    let isPriority = filterService.isPriority();
    let typesFilters = filterService.get("orderTypeFilters");
    let stateFilters = _.without(
      filterService.get("orderStateFilters"),
      STATE_FILTERS.PRIORITY
    );

    return {
      state: utils.stringifyArray(stateFilters),
      type: utils.stringifyArray(typesFilters),
      priority: isPriority,
      after: after && after.getTime(),
      before: before && before.getTime()
    };
  },

  actions: {
    /**
     * Load the next page of the list
     *
     * @memberof OrdersSearchController
     * @param {number} pageNo the page to load
     * @returns {Promise<Order[]>}
     */
    loadMoreOrders(pageNo) {
      const params = this.trimQuery(
        _.merge(
          {},
          this.getFilterQuery(),
          this.getSearchQuery(),
          this.getPaginationQuery(pageNo)
        )
      );

      return this.get("store")
        .query("designation", params)
        .then(results => {
          this.afterSearch(results);
          return results;
        });
    }
  }
});
