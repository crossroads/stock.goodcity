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
        column_name: value[0],
        is_desc: value[1]
      };
    }
  }),

  sortingQueryOn(column, is_desc = false) {
    return {
      column_name: column,
      is_desc: is_desc
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

    applySortOn(sort_column, column_alias, is_desc = false) {
      this.sortingQueryOn(column_alias, is_desc);
      this.set("setDefaultSortingColumn", [sort_column, is_desc]);
      this.toggleProperty("displayDropDownItems");
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
