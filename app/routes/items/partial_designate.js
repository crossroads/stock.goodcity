import Ember from "ember";
import AuthorizeRoute from "./../authorize";
const { getOwner } = Ember;

export default AuthorizeRoute.extend({
  designateFullSet: Ember.computed.localStorage(),

  beforeModel() {
    this._super(...arguments);
  },

  model(params) {
    getOwner(this)
      .lookup("controller:items.search_order")
      .set("notPartialRoute", false);
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
    return this.store.findRecord("item", params.item_id);
  },

  afterModel() {
    getOwner(this)
      .lookup("controller:items.search_order")
      .set("notPartialRoute", false);
  },

  setupController(controller, model) {
    this._super(controller, model);
    controller.set("item", model);
    var isDesignateFullSet = window.localStorage.getItem("designateFullSet");
    if (isDesignateFullSet !== null) {
      controller.set(
        "returnsDesignateFullSet",
        !window.localStorage.getItem("designateFullSet").includes(false)
      );
    } else {
      this.set("designateFullSet", false);
      controller.set("returnsDesignateFullSet", false);
    }
  }
});
