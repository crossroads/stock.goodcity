import $ from "jquery";
import { observer, computed } from "@ember/object";
import { inject as service } from "@ember/service";
import TextField from "@ember/component/text-field";

export default TextField.extend({
  tagName: "input",
  type: "text",
  attributeBindings: ["name", "id", "value", "placeholder"],
  cordova: service(),
  store: service(),
  hasRecentDesignations: true,

  triggerAutofocus: observer("value", function() {
    if (this.get("value").length === 0) {
      this.$().focus();
    }
  }),

  hasFixedInputHeader: computed(function() {
    return this.get("cordova").isIOS() && $(".fixed_search_header").length > 0;
  }),

  scrollToStart() {
    $(".fixed_search_header").addClass("absolute");
    $(".footer").addClass("absolute_footer");
    $(".search").addClass("no-padding");

    document.body.scrollTop = document.documentElement.scrollTop = 0;
  },

  focusOut() {
    if (this.get("hasFixedInputHeader")) {
      $(".fixed_search_header").removeClass("absolute");
      $(".footer").removeClass("absolute_footer");
      $(".search").removeClass("no-padding");
    }
  },

  didInsertElement() {
    let currentRouteName = this.router.currentRouteName;
    let isIndexRoute = currentRouteName === "items.index" ? true : false;
    if (this.get("hasRecentDesignations") && isIndexRoute) {
      var recentlyUsedDesignations = this.get("store").query("designation", {
        shallow: true,
        recently_used: true
      });
      recentlyUsedDesignations.forEach(record => {
        if (record.constructor.toString() === "stock@model:designation:") {
          this.store.query("orders_package", {
            search_by_order_id: record.get("id")
          });
        }
      });
      var recentlyUsedLocations = this.get("store").query("location", {
        recently_used: true
      });
      this.get("store").pushPayload(recentlyUsedDesignations);
      this.get("store").pushPayload(recentlyUsedLocations);
      this.set("hasRecentDesignations", false);
    }
    document.body.scrollTop = document.documentElement.scrollTop = 0;
    this.$().focus();
    if (this.get("hasFixedInputHeader")) {
      this.element.addEventListener("touchstart", this.scrollToStart);
    }
  },

  willDestroyElement() {
    if (this.get("hasFixedInputHeader")) {
      this.element.addEventListener("touchstart", this.scrollToStart);
    }
  }
});
