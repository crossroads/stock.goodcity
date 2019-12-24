import { all } from "rsvp";
import { computed } from "@ember/object";
import { alias, sort } from "@ember/object/computed";
import Controller from "@ember/controller";
import { getOwner } from "@ember/application";
import AjaxPromise from "stock/utils/ajax-promise";
import config from "../../config/environment";

export default Controller.extend({
  queryParams: ["typeId", "fromClientInformation"],
  order: alias("model.orderUserOrganisation.order"),
  typeId: null,
  fromClientInformation: false,
  qty: null,
  otherDetails: "",
  sortProperties: ["id"],
  sortedGcRequests: sort("order.goodcityRequests", "sortProperties"),
  isMobileApp: config.cordova.enabled,

  hasNoGcRequests: computed("order.goodcityRequests", function() {
    return !this.get("order.goodcityRequests").length;
  }),

  sortedGcRequestsLength: computed("order.goodcityRequests", function() {
    return this.get("order.goodcityRequests").length > 1;
  }),

  actions: {
    addRequest() {
      var orderId = this.get("order.id");
      var goodcityRequestParams = {};
      goodcityRequestParams["quantity"] = 1;
      goodcityRequestParams["order_id"] = orderId;
      var loadingView = getOwner(this)
        .lookup("component:loading")
        .append();

      new AjaxPromise(
        "/goodcity_requests",
        "POST",
        this.get("session.authToken"),
        { goodcity_request: goodcityRequestParams }
      )
        .then(data => {
          this.get("store").pushPayload(data);
        })
        .finally(() => {
          loadingView.destroy();
        });
    },

    saveGoodsDetails() {
      if (this.get("hasNoGcRequests")) {
        return false;
      }
      var promises = [];
      this.get("order.goodcityRequests").forEach(goodcityRequest => {
        promises.push(goodcityRequest.save());
      });

      var loadingView = getOwner(this)
        .lookup("component:loading")
        .append();

      all(promises).finally(() => {
        this.transitionToRoute(
          "order.appointment_details",
          this.get("order.id")
        );
        loadingView.destroy();
      });
    }
  }
});
