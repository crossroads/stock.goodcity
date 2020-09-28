import detail from "./detail";
import _ from "lodash";

export default detail.extend({
  goodcityRequestService: Ember.inject.service(),
  packageService: Ember.inject.service(),
  packageTypeService: Ember.inject.service(),

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

  dropDownItems: ["Inventory ID 1", "Inventory ID 2", "Inventory ID 3"],

  states: ["Designated", "Dispatched", "Cancelled"],

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
    },

    async addRequest() {
      const pgkType = await this.get(
        "packageTypeService"
      ).userPickPackageType();
      if (pgkType) {
        await this.get("goodcityRequestService").createGcRequest({
          package_type_id: pgkType.get("id"),
          quantity: 1,
          order_id: this.get("order.id")
        });
      }
    }
  }
});
