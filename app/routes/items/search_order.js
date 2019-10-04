import Ember from "ember";
import AuthorizeRoute from "./../authorize";
const { getOwner } = Ember;

export default AuthorizeRoute.extend({
  queryParams: {
    showDispatchOverlay: false,
    isSet: false,
    partial_qty: false
  },

  partial_qnty: Ember.computed.localStorage(),
  messageBox: Ember.inject.service(),
  transition: null,

  partialDesignatePath: true,
  itemDesignateBackLinkPath: Ember.computed.localStorage(),

  beforeModel(transition) {
    getOwner(this)
      .lookup("controller:items.detail")
      .set("callOrderObserver", true);
    this._super(...arguments);
    this.set("transition", transition);
    var previousRoutes = this.router.router.currentHandlerInfos;
    var previousRoute = previousRoutes && previousRoutes.pop();

    var path = "items.index";

    if (previousRoute && routeName.indexOf("detail")) {
      path = previousRoute.name;
    }

    this.set(
      "partialDesignatePath",
      Boolean(parseInt(window.localStorage.getItem("partial_qnty"), 10))
    );
    this.set("itemDesignateBackLinkPath", path);
  },

  model(params) {
    var item = this.store.peekRecord("item", params.item_id);
    var recentlyUsedDesignations = this.store
      .peekAll("designation")
      .filterBy("recentlyUsedAt");

    recentlyUsedDesignations.forEach(record => {
      if (record.constructor.toString() === "stock@model:designation:") {
        this.store.query("orders_package", {
          search_by_order_id: record.get("id")
        });
      }
    });

    return Ember.RSVP.hash({
      item: item || this.store.findRecord("item", params.item_id),
      designations: recentlyUsedDesignations.get("length")
        ? recentlyUsedDesignations
        : this.get("store").query("designation", {
            shallow: true,
            recently_used: true
          })
    });
  },

  setupController(controller, model) {
    this._super(controller, model);

    let isNotPartialRoute =
      !this.get("partialDesignatePath") &&
      !parseInt(window.localStorage.getItem("partial_qnty"), 10);

    controller.set("notPartialRoute", isNotPartialRoute);
    controller.set("searchText", "");
    controller.set("backLinkPath", this.get("itemDesignateBackLinkPath"));
  },

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set("partial_qty", undefined);
      controller.set("isSet", undefined);
    }
  }
});
