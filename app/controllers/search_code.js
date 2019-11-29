import Ember from "ember";
import { translationMacro as t } from "ember-i18n";
import AjaxPromise from "stock/utils/ajax-promise";
import AsyncMixin, { ERROR_STRATEGIES } from "../mixins/async";

export default Ember.Controller.extend(AsyncMixin, {
  queryParams: ["backToNewItem", "orderId", "changeCode", "reqId"],
  reqId: null,
  backToNewItem: false,
  changeCode: false,
  orderId: null,
  filter: "",
  searchText: "",
  fetchMoreResult: true,
  searchPlaceholder: t("search.placeholder"),
  i18n: Ember.inject.service(),
  isSearchCodePreviousRoute: Ember.computed.localStorage(),

  allPackageTypes: Ember.computed("fetchMoreResult", function() {
    return this.store.peekAll("code").filterBy("visibleInSelects", true);
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

  clearHiglight() {
    Ember.$("em").replaceWith(function() {
      return this.innerHTML;
    });
  },

  updateRequestCode(packageType, requestId) {
    const url = `/goodcity_requests/${requestId}`;

    return this.runTask(async () => {
      const data = await new AjaxPromise(
        url,
        "PUT",
        this.get("session.authToken"),
        {
          goodcity_request: {
            package_type_id: packageType.id
          }
        }
      );
      this.get("store").pushPayload(data);
    }, ERROR_STRATEGIES.MODAL);
  },

  actions: {
    clearSearch(isCancelled) {
      this.set("filter", "");
      this.set("searchText", "");
      this.set("fetchMoreResult", true);
      if (!isCancelled) {
        Ember.$("#searchText").focus();
      }
    },

    cancelSearch() {
      Ember.$("#searchText").blur();
      this.send("clearSearch", true);
      if (this.get("backToNewItem")) {
        this.replaceRoute("items.new");
      } else {
        window.history.back();
      }
    },

    assignItemLabel(type) {
      this.set("isSearchCodePreviousRoute", true);
      if (type) {
        this.replaceRoute("items.new", { queryParams: { codeId: type.id } });
      }
    }
  }
});
