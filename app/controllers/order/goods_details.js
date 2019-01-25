import Ember from "ember";
const { getOwner } = Ember;
import config from '../../config/environment';
import AjaxPromise from 'stock/utils/ajax-promise';

export default Ember.Controller.extend({
  isMobileApp: config.cordova.enabled,
  queryParams: ["typeId", "fromClientInformation"],
  order: Ember.computed.alias("model.orderUserOrganisation.order"),
  typeId: null,
  fromClientInformation: false,
  qty: null,
  otherDetails: "",
  sortProperties: ["id"],
  sortedGcRequests: Ember.computed.sort("order.goodcityRequests", "sortProperties"),

  hasNoGcRequests: Ember.computed("order.goodcityRequests", function() {
    return (!this.get('order.goodcityRequests').length);
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

      Ember.RSVP.all(promises).then(function(){
        loadingView.destroy();
      }).finally(() =>{
        this.transitionToRoute('order.appointment_details', this.get("order.id"));
      });
    }
  }
});
