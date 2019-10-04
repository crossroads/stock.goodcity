import Ember from "ember";
import SessionRoute from "./session";
import AjaxPromise from "stock/utils/ajax-promise";

export default SessionRoute.extend({
  model() {
    let canViewDashboard = this.get("session.currentUser.canViewDashboard");
    var recentlyUsedDesignations = this.get("store").query("designation", {
      recently_used: true
    });
    var recentlyUsedLocations = this.get("store").query("location", {
      recently_used: true
    });

    recentlyUsedDesignations.forEach(record => {
      if (record.constructor.toString() === "stock@model:designation:") {
        this.store.query("orders_package", {
          search_by_order_id: record.get("id")
        });
      }
    });

    this.get("store").pushPayload(recentlyUsedDesignations);
    this.get("store").pushPayload(recentlyUsedLocations);

    if (canViewDashboard) {
      return Ember.RSVP.hash({
        ordersCount: new AjaxPromise(
          "/orders/summary",
          "GET",
          this.session.get("authToken")
        ),
        recentlyUsedDesignations: recentlyUsedDesignations
      });
    }
  }
});
