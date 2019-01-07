import Ember from "ember";
const { getOwner } = Ember;
import AjaxPromise from 'stock/utils/ajax-promise';

export default Ember.Controller.extend({
  queryParams: ["typeId", "fromClientInformation"],
  order: Ember.computed.alias("model"),
  typeId: null,
  fromClientInformation: false,
  qty: null,
  otherDetails: "",
  sortProperties: ["id"],
  sortedGcRequests: Ember.computed.sort("gcRequests.goodcity_request", "sortProperties"),

  gcRequests: Ember.computed(function() {
    return this.store.peekAll('goodcity_request');
  }),

  hasNoGcRequests: Ember.computed("model.goodcityRequests", function() {
    return (!this.get('model.goodcityRequests').length);
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
