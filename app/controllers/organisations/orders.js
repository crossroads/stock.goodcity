import Ember from "ember";
import _ from "lodash";
import SearchMixin from "stock/mixins/search_resource";

export default Ember.Controller.extend(SearchMixin, {
  gcOrganisationUsers: null,

  actions: {
    /**
     * Load the next page of the list
     *
     * @memberof OrdersSearchController
     * @param {number} pageNo the page to load
     * @returns {Promise<Order[]>}
     */
    loadOrders(pageNo) {
      const cache = this.get("cache");
      const params = this.trimQuery(
        _.merge(
          {
            slug: "organisation_orders",
            organisationId: this.get("model.id")
          },
          this.getPaginationQuery(pageNo)
        )
      );
      return this.get("store").query("gcOrganisation", params);
    }
  }
});
