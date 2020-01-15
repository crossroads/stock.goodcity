import { debounce, later } from "@ember/runloop";
import $ from "jquery";
import { computed, observer } from "@ember/object";
import { inject as service } from "@ember/service";
import Component from "@ember/component";
import _ from "lodash";
import SearchMixin from "stock/mixins/search_resource";

/**
 * An overlay that pops up from the bottom of the screen, allowing the user
 * to search and select an order.
 *
 * The popup *does not* do anythinng to the order apart from returning it
 *
 * @property {boolean} open whether the popup is visible or not
 * @property {function} onSelect callback triggered when an order is selected
 */
export default Component.extend(SearchMixin, {
  fetchMoreResult: true,
  store: service(),
  filter: "",
  searchText: "",
  fetchMoreResult: true,
  storageType: null,
  isSearchCodePreviousRoute: computed.localStorage(),

  init() {
    this._super("code-search-overlay");
  },

  allPackageTypes: computed("open", function() {
    return this.get("store").peekAll("code");
  }),

  filteredPackageTypes: computed("allPackageTypes", function() {
    const pkgTypes = this.get("allPackageTypes");
    const storageType = this.get("storageType");
    if (["Box", "Pallet"].indexOf(storageType) > -1) {
      return pkgTypes.filterBy(`allow_${storageType.toLowerCase()}`, true);
    }
    return pkgTypes;
  }),

  hasSearchText: computed("searchText", function() {
    return $.trim(this.get("searchText")).length;
  }),

  hasFilter: computed("filter", function() {
    return $.trim(this.get("filter")).length;
  }),

  onSearchTextChange: observer("searchText", function() {
    // wait before applying the filter
    debounce(this, this.applyFilter, 500);
  }),

  applyFilter: function() {
    this.set("filter", this.get("searchText"));
    this.set("fetchMoreResult", true);
  },

  clearHiglight() {
    $("em").replaceWith(function() {
      return this.innerHTML;
    });
  },

  highlight() {
    var string = $.trim(this.get("filter").toLowerCase());
    this.clearHiglight();
    $(".codes_results li div").each(function() {
      var text = $(this).text();
      if (text.toLowerCase().indexOf(string.toLowerCase()) > -1) {
        var matchStart = text
          .toLowerCase()
          .indexOf("" + string.toLowerCase() + "");
        var matchEnd = matchStart + string.length - 1;
        var beforeMatch = text.slice(0, matchStart);
        var matchText = text.slice(matchStart, matchEnd + 1);
        var afterMatch = text.slice(matchEnd + 1);
        $(this).html(beforeMatch + "<em>" + matchText + "</em>" + afterMatch);
      }
    });
  },

  filteredResults: computed(
    "filter",
    "fetchMoreResult",
    "allPackageTypes.[]",
    function() {
      let packageTypes = this.get("filteredPackageTypes");
      var filter = $.trim(this.get("filter").toLowerCase());
      var types = [];
      var matchFilter = value =>
        (value || "").toLowerCase().indexOf(filter) !== -1;

      if (filter.length > 0) {
        packageTypes.forEach(function(type) {
          if (
            matchFilter(type.get("name")) ||
            matchFilter(type.get("otherTerms"))
          ) {
            types.push(type);
          }
        });
        later(this, this.highlight);
      } else {
        types = types.concat(packageTypes.toArray());
        this.clearHiglight();
      }

      return types.sortBy("name").uniq();
    }
  ),

  actions: {
    cancel() {
      this.set("searchText", "");
      this.set("open", false);
    },

    assignItemLabel(type) {
      this.set("open", false);
      this.set("isSearchCodePreviousRoute", true);
      if (type) {
        this.get("router").replaceWith("items.new", {
          queryParams: { codeId: type.id, storageType: this.get("storageType") }
        });
      }
    }
  }
});
