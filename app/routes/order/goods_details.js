import Ember from 'ember';
import AuthorizeRoute from './../authorize';
import AjaxPromise from 'stock/utils/ajax-promise';

export default AuthorizeRoute.extend({
  model(params) {
    let store = this.store;
    let orderId = params.order_id;
    var goodcityRequestParams = {};
    goodcityRequestParams['quantity'] = 1;
    goodcityRequestParams['order_id'] = orderId;

    return new AjaxPromise(`/orders/${orderId}/`, "GET", this.get('session.authToken'))
      .then((data) => {
        this.set("orderId", data["designation"]["id"]);
        this.get("store").pushPayload(data);
        if(!data['goodcity_requests'].length){
          return new AjaxPromise("/goodcity_requests", "POST", this.get('session.authToken'), {  goodcity_request: goodcityRequestParams })
          .then(data => {
            this.get("store").pushPayload(data);
          });
        }
    });
  },

  setupController(controller, model) {
    model = this.store.peekRecord("designation", this.get("orderId"));
    controller.set("model", model);
  },

  deactivate() {
    this.controllerFor('application').set('showSidebar', true);
  }
});
