import Ember from "ember";
const { getOwner } = Ember;
import AjaxPromise from "stock/utils/ajax-promise";
import config from "../../config/environment";
import AsyncMixin, { ERROR_STRATEGIES } from "stock/mixins/async";

export default Ember.Controller.extend(AsyncMixin, {
  goodcityRequest: Ember.inject.service(),

  queryParams: ["typeId", "fromClientInformation"],
  order: Ember.computed.alias("model.orderUserOrganisation.order"),
  typeId: null,
  fromClientInformation: false,
  qty: null,
  otherDetails: "",
  sortProperties: ["id"],
  sortedGcRequests: Ember.computed.sort(
    "order.goodcityRequests",
    "sortProperties"
  ),
  isMobileApp: config.cordova.enabled,

  hasNoGcRequests: Ember.computed("order.goodcityRequests", function() {
    return !this.get("order.goodcityRequests").length;
  }),

  sortedGcRequestsLength: Ember.computed("order.goodcityRequests", function() {
    return this.get("order.goodcityRequests").length > 1;
  }),

  actions: {
    async addRequest() {
      await this.get("goodcityRequest").createGcRequest({
        quantity: 1,
        order_id: this.get("order.id")
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

      Ember.RSVP.all(promises).finally(() => {
        this.transitionToRoute(
          "order.appointment_details",
          this.get("order.id")
        );
        loadingView.destroy();
      });
    }
  }
});
