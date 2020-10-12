import detail from "./detail";
import {
  ORDERS_PACKAGES_SORTING_OPTIONS,
  ORDERS_PACKAGES_STATES
} from "stock/constants/orders-packages-sorting-options";
import SearchMixin from "stock/mixins/search_resource";
import _ from "lodash";

export default detail.extend(SearchMixin, {
  // ----- Services -----
  goodcityRequestService: Ember.inject.service(),
  packageService: Ember.inject.service(),
  packageTypeService: Ember.inject.service(),

  // ----- Arguments -----
  dropDownItems: _.cloneDeep(ORDERS_PACKAGES_SORTING_OPTIONS),
  states: _.cloneDeep(ORDERS_PACKAGES_STATES),
  displayDropDownItems: false,
  sortingColumn: _.cloneDeep(ORDERS_PACKAGES_SORTING_OPTIONS)[0],
  autoLoad: true,
  /*
   * @type {Number}, perPage in response
   */
  perPage: 25,
  ordersPkgLength: 0,
  sortProperties: ["id"],

  // ----- Computed Properties -----
  sortedGcRequests: Ember.computed.sort(
    "model.goodcityRequests",
    "sortProperties"
  ),

  filteredStates: Ember.computed("states.@each.enabled", function() {
    return _.filter(this.get("states"), ["enabled", true]).map(
      ({ state }) => state
    );
  }),

  onStatesChange: Ember.observer("states.@each.enabled", function() {
    this.reloadResults();
  }),

  // ----- Helpers -----
  getStates() {
    const utilities = this.get("utilityMethods");
    const state = utilities.stringifyArray(this.get("filteredStates"));
    return {
      state
    };
  },

  getSortQuery() {
    const sortOptions = this.get("sortingColumn");
    return {
      sort_column: sortOptions["column_alias"],
      is_desc: /desc/.test(sortOptions["sort"])
    };
  },

  // ----- Actions -----
  actions: {
    loadOrdersPackages(pageNo) {
      const params = this.trimQuery(
        _.merge(
          { order_id: this.get("orderId") },
          this.getSearchQuery(),
          this.getPaginationQuery(pageNo),
          this.getStates(),
          this.getSortQuery()
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
      this.set("sortingColumn", options);
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
