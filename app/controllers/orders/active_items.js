import detail from "./detail";
import { ORDER_SORTING_OPTIONS } from "stock/constants/order-sorting-options";
import SearchMixin from "stock/mixins/search_resource";
import _ from "lodash";

export default detail.extend(SearchMixin, {
  goodcityRequestService: Ember.inject.service(),
  packageService: Ember.inject.service(),
  packageTypeService: Ember.inject.service(),
  dropDownItems: ORDER_SORTING_OPTIONS,
  states: ["Designated", "Dispatched", "Cancelled"],
  displayDropDownItems: false,

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

  setDefaultSortingColumn: Ember.computed("dropDownItems", {
    get(key) {
      return ORDER_SORTING_OPTIONS[0];
    },
    set(key, value) {
      return {
        column_name: value["column_name"],
        is_desc: value["is_desc"]
      };
    }
  }),

  sortingQueryOn(options) {
    return {
      sort_column: options["column_alias"],
      is_desc: options["is_desc"]
    };
  },

  actions: {
    loadOrdersPackages(pageNo) {
      const params = this.trimQuery(
        _.merge(
          { order_id: this.get("orderId") },
          this.getSearchQuery(),
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

    applySortOn(options) {
      this.sortingQueryOn(options);
      this.set("setDefaultSortingColumn", options);
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
