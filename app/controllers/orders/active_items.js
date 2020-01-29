import detail from "./detail";
import _ from "lodash";

export default detail.extend({
  autoLoad: true,
  /*
   * @type {Number}, perPage in response
   */
  perPage: 25,
  ordersPkgLength: 0,
  sortProperties: ["id"],
  sortedGcRequests: Ember.computed.sort(
    "model.goodcityRequests",
    "sortProperties"
  ),

  actions: {
    loadOrdersPackages(pageNo) {
      const params = this.trimQuery(
        _.merge(
          { order_id: this.get("orderId") },
          this.getPaginationQuery(pageNo)
        )
      );
      return this.get("store")
        .query("orders_package", params)
        .then(ordersPkgs => {
          this.set("ordersPkgLength", ordersPkgs.meta.orders_packages_count);
          return ordersPkgs;
        });
    }
  }
});
