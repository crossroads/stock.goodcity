import Ember from "ember";
const { getOwner } = Ember;
import AjaxPromise from 'stock/utils/ajax-promise';
import config from '../../config/environment';

export default Ember.Controller.extend({
  queryParams: ["typeId", "fromClientInformation"],
  order: Ember.computed.alias("model.orderUserOrganisation.order"),
  typeId: null,
  fromClientInformation: false,
  qty: null,
  otherDetails: "",
  sortProperties: ["id"],
  sortedGcRequests: Ember.computed.sort("order.goodcityRequests", "sortProperties"),
  isMobileApp: config.cordova.enabled,

  hasNoGcRequests: Ember.computed("order.goodcityRequests", function() {
    return (!this.get('order.goodcityRequests').length);
  }),

  sortedGcRequestsLength: Ember.computed("order.goodcityRequests", function() {
    return (this.get('order.goodcityRequests').length > 1);
  }),

  actions: {
    addRequest(){
      var orderId = this.get('order.id');
      var goodcityRequestParams = {};
      goodcityRequestParams['quantity'] = 1;
      goodcityRequestParams['order_id'] = orderId;
      var loadingView = getOwner(this).lookup('component:loading').append();

      new AjaxPromise("/goodcity_requests", "POST", this.get('session.authToken'), { goodcity_request: goodcityRequestParams })
        .then(data => {
          this.get("store").pushPayload(data);
        })
        .finally(() => {
          loadingView.destroy();
        });
    },

    saveGoodsDetails(){
      if(this.get('hasNoGcRequests')){return false;}
      var promises = [];
      this.get('order.goodcityRequests').forEach(goodcityRequest => {
        promises.push(goodcityRequest.save());
      });

      var loadingView = getOwner(this).lookup('component:loading').append();

      Ember.RSVP.all(promises).finally(() => {
        this.transitionToRoute('order.appointment_details', this.get("order.id"));
        loadingView.destroy();
      });
    }
  }
});
