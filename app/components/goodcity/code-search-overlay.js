import Ember from "ember";
import _ from "lodash";
import SearchMixin from "stock/mixins/search_resource";
import AsyncMixin, { ASYNC_BEHAVIOURS } from "stock/mixins/async";

/**
 * An overlay that pops up from the bottom of the screen, allowing the user
 * to search and select an order.
 *
 * The popup *does not* do anythinng to the order apart from returning it
 *
 * @property {boolean} open whether the popup is visible or not
 * @property {function} onSelect callback triggered when an order is selected
 */
export default Ember.Component.extend(SearchMixin, AsyncMixin, {
  store: Ember.inject.service(),
  packageTypeService: Ember.inject.service(),
  filter: "",
  searchText: "",
  fetchMoreResult: true,
  storageType: null,

  init() {
    this._super("code-search-overlay");
    this.get("router").addObserver("currentRouteName", () =>
      this.closeOverlay()
    );
  },

  recentPackageTypes: Ember.computed("open", "storageType", function() {
    const userFavourites = this.get("store").peekAll("user_favourite");
    const storageType = this.get("storageType");

    const packageTypeIds = userFavourites
      .filterBy("favourite_type", "PackageType")
      .getEach("favourite_id")
      .reverse()
      .uniq();
    const pkgTypes = packageTypeIds.map(it =>
      this.get("store").peekRecord("code", it)
    );

    if (storageType) {
      return pkgTypes.filterBy(`allow${storageType}`, true);
    }

    return pkgTypes;
  }),

  allPackageTypes: Ember.computed("open", "subsetPackageTypes", function() {
    if (this.get("subsetPackageTypes")) {
      return this.get("subsetPackageTypes");
    }
    return this.get("store").peekAll("code");
  }),

  filteredPackageTypes: Ember.computed(
    "allPackageTypes",
    "storageType",
    function() {
      const pkgTypes = this.get("allPackageTypes");
      const storageType = this.get("storageType");
      if (storageType) {
        return pkgTypes.filterBy(`allow${storageType}`, true);
      }
      return pkgTypes;
    }
  ),

  hasSearchText: Ember.computed("searchText", function() {
    return Ember.$.trim(this.get("searchText")).length;
  }),

  onSearchTextChange: Ember.observer("searchText", function() {
    // wait before applying the filter
    Ember.run.debounce(this, this.applyFilter, 500);
  }),

  applyFilter: function() {
    this.set("filter", this.get("searchText"));
    this.set("fetchMoreResult", true);
  },

  filteredResults: Ember.computed(
    "filter",
    "fetchMoreResult",
    "allPackageTypes.[]",
    function() {
      let packageTypes = this.get("filteredPackageTypes");
      var filter = Ember.$.trim(this.get("filter").toLowerCase());
      var types = [];
      var matchFilter = value =>
        (value || "").toLowerCase().indexOf(filter) !== -1;

      if (filter.length > 0) {
        packageTypes.forEach(function(type) {
          if (
            matchFilter(type.get("code")) ||
            matchFilter(type.get("name")) ||
            matchFilter(type.get("otherTerms"))
          ) {
            types.push(type);
          }
        });
      } else {
        types = types.concat(packageTypes.toArray());
      }

      return types.sortBy("name").uniq();
    }
  ),

  closeOverlay() {
    this.setProperties({
      searchText: "",
      filter: "",
      open: false,
      onSelect: null,
      fetchMoreResult: true,
      storageType: null
    });
  },

  actions: {
    closeOverlay() {
      this.closeOverlay();
    },

    clearSearch() {
      this.set("searchText", "");
    },

    selectCode(code) {
      this.getWithDefault("onSelect", _.noop)(code);
      this.closeOverlay();
    }
  }
});
