import Ember from "ember";
import searchModule from "../search_module";

export default searchModule.extend({
  queryParams: ["isSet", "showDispatchOverlay", "partial_qty"],
  isSet: null,
  showDispatchOverlay: false,
  toDesignateItem: true,
  partial_qty: 0,
  notPartialRoute: false,
  item: Ember.computed.alias("model.item"),
  searchModelName: "designation",
  minSearchTextLength: 2,
  messageBox: Ember.inject.service(),
  intl: Ember.inject.service(),

  sortProperties: ["recentlyUsedAt:desc"],
  recentlyUsedDesignations: Ember.computed.sort(
    "model.designations",
    "sortProperties"
  ),

  displayUserPrompt: false,
  showAllSetItems: false,
  selectedDesignation: null,
  toggleOverlay: true,
  smallOrderBlocks: true,
  excludeAssociations: true,

  actions: {
    setOrder(order) {
      var _this = this;
      //Don't allow to designate if Order is of type "GoodCity" and is in cancelled or closed state
      if (
        order &&
        order.get("isGoodCityOrder") &&
        (order.get("isCancelled") || order.get("isClosed"))
      ) {
        _this.get("messageBox").alert(
          _this
            .get("intl")
            .t("order_details.cannot_designate_to_gc_order", () => {
              return false;
            })
        );
      } else {
        this.set("order", order);
        this.toggleProperty("toggleOverlay");
      }
    },

    displayMoveOverlay(designation) {
      this.set("displayUserPrompt", true);
      this.set("selectedDesignation", designation);
    }
  }
});
