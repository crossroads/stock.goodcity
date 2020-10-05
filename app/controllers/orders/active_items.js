import detail from "./detail";
import {
  ORDER_SORTING_OPTIONS,
  ORDER_PACKAGES_STATES
} from "stock/constants/order-sorting-options";
import SearchMixin from "stock/mixins/search_resource";
import _ from "lodash";

export default detail.extend(SearchMixin, {
  goodcityRequestService: Ember.inject.service(),
  packageService: Ember.inject.service(),
  packageTypeService: Ember.inject.service(),
  dropDownItems: ORDER_SORTING_OPTIONS,
  states: ORDER_PACKAGES_STATES,
  displayDropDownItems: false,
  filteredStates: [],

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
      return value;
    }
  }),

  getStates() {
    const utilities = this.get("utilityMethods");
    const state = utilities.stringifyArray(this.getFilteredStates());
    return {
      state
    };
  },

  getFilteredStates() {
    return _.filter(this.get("states"), ["enabled", true]).map(
      ({ state }) => state
    );
  },

  stateList: Ember.observer("states.@each.enabled", function() {
    this.reloadResults();
    this.set("filteredStates", this.getFilteredStates());
  }),

  getSortQuery() {
    const sortOptions = this.get("setDefaultSortingColumn");
    return {
      sort_column: sortOptions["column_alias"],
      is_desc: sortOptions["is_desc"]
    };
  },

  actions: {
    loadOrdersPackages(pageNo) {
      const params = this.trimQuery(
        _.merge(
          { order_id: this.get("orderId") },
          this.getSearchQuery(),
          this.getPaginationQuery(pageNo),
          this.getStates()
          // this.getSortQuery()
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
      this.set("setDefaultSortingColumn", options);
      this.reloadResults();
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
    },

    clearSearch() {
      this.set("searchText", "");
    }
  }
});
