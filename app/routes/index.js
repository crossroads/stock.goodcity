import Ember from "ember";
import SessionRoute from "./session";
import AjaxPromise from "stock/utils/ajax-promise";

export default SessionRoute.extend({
  model() {
    let canViewDashboard = this.get("session.currentUser.canManageOrders");
    var recentlyUsedDesignations = this.get("store").query("designation", {
      recently_used: true,
      shallow: true
    });

    this.get("store").pushPayload(recentlyUsedDesignations);

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
