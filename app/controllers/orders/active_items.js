import detail from "./detail";
import Cache from "stock/utils/mem-cache";
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

  init() {
    this._super(...arguments);
    this.cache = new Cache();
  },

  createCacheKey(data) {
    return JSON.stringify(data);
  },

  actions: {
    loadOrdersPackages(pageNo) {
      const cache = this.get("cache");
      const params = this.trimQuery(
        _.merge(
          { order_id: this.get("orderId") },
          this.getPaginationQuery(pageNo)
        )
      );
      const cacheKey = this.createCacheKey(params);
      if (cache.has(cacheKey)) {
        const ordersPackages = cache.get(cacheKey);
        this.set("ordersPkgLength", ordersPackages.meta.orders_packages_count);
        return ordersPackages;
      }
      return this.get("store")
        .query("orders_package", params)
        .then(ordersPkgs => {
          this.set("ordersPkgLength", ordersPkgs.meta.orders_packages_count);
          cache.set(cacheKey, ordersPkgs);
          return ordersPkgs;
        });
    }
  }
});
