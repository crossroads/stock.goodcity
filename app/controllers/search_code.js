import { debounce, later } from "@ember/runloop";
import $ from "jquery";
import { computed, observer } from "@ember/object";
import { inject as service } from "@ember/service";
import { translationMacro as t } from "ember-i18n";
import AjaxPromise from "stock/utils/ajax-promise";
import AsyncMixin, { ERROR_STRATEGIES } from "../mixins/async";
import GoodcityController from "./goodcity_controller";

export default GoodcityController.extend(AsyncMixin, {
  queryParams: ["backToNewItem", "orderId", "changeCode", "reqId"],
  reqId: null,
  backToNewItem: false,
  changeCode: false,
  orderId: null,
  filter: "",
  searchText: "",
  fetchMoreResult: true,
  searchPlaceholder: t("search.placeholder"),
  i18n: service(),
  isSearchCodePreviousRoute: computed.localStorage(),

  allPackageTypes: computed("fetchMoreResult", function() {
    return this.store.peekAll("code").filterBy("visibleInSelects", true);
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

  filteredResults: computed(
    "filter",
    "fetchMoreResult",
    "allPackageTypes.[]",
    function() {
      var filter = $.trim(this.get("filter").toLowerCase());
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
        later(this, this.highlight);
      } else {
        types = types.concat(this.get("allPackageTypes").toArray());
        this.clearHiglight();
      }

      return types.sortBy("name").uniq();
    }
  ),

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

  clearHiglight() {
    $("em").replaceWith(function() {
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
        $("#searchText").focus();
      }
    },

    cancelSearch() {
      $("#searchText").blur();
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
