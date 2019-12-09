import Ember from "ember";
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
export default Ember.Component.extend(SearchMixin, {
  fetchMoreResult: true,
  store: Ember.inject.service(),
  filter: "",
  searchText: "",
  fetchMoreResult: true,

  init() {
    this._super("package-search-overlay");
  },

  allPackageTypes: Ember.computed("open", function() {
    return this.get("store").peekAll("code");
  }),

  hasSearchText: Ember.computed("searchText", function() {
    return Ember.$.trim(this.get("searchText")).length;
  }),

  hasFilter: Ember.computed("filter", function() {
    return Ember.$.trim(this.get("filter")).length;
  }),

  onSearchTextChange: Ember.observer("searchText", function() {
    // wait before applying the filter
    Ember.run.debounce(this, this.applyFilter, 500);
  }),

  applyFilter: function() {
    this.set("filter", this.get("searchText"));
    this.set("fetchMoreResult", true);
  },

  clearHiglight() {
    Ember.$("em").replaceWith(function() {
      return this.innerHTML;
    });
  },

  highlight() {
    var string = Ember.$.trim(this.get("filter").toLowerCase());
    this.clearHiglight();
    Ember.$(".codes_results li div").each(function() {
      var text = Ember.$(this).text();
      if (text.toLowerCase().indexOf(string.toLowerCase()) > -1) {
        var matchStart = text
          .toLowerCase()
          .indexOf("" + string.toLowerCase() + "");
        var matchEnd = matchStart + string.length - 1;
        var beforeMatch = text.slice(0, matchStart);
        var matchText = text.slice(matchStart, matchEnd + 1);
        var afterMatch = text.slice(matchEnd + 1);
        Ember.$(this).html(
          beforeMatch + "<em>" + matchText + "</em>" + afterMatch
        );
      }
    });
  },

  filteredResults: Ember.computed(
    "filter",
    "fetchMoreResult",
    "allPackageTypes.[]",
    function() {
      var filter = Ember.$.trim(this.get("filter").toLowerCase());
      var types = [];
      var matchFilter = value =>
        (value || "").toLowerCase().indexOf(filter) !== -1;

      if (filter.length > 0) {
        this.get("allPackageTypes").forEach(function(type) {
          if (
            matchFilter(type.get("name")) ||
            matchFilter(type.get("otherTerms"))
          ) {
            types.push(type);
          }
        });
        Ember.run.later(this, this.highlight);
      } else {
        types = types.concat(this.get("allPackageTypes").toArray());
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

    selectOrder(order) {},

    loadMoreOrders(pageNo) {}
  }
});
