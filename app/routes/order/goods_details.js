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
        store.pushPayload(data);
        if(!data['goodcity_requests'].length){
          return new AjaxPromise("/goodcity_requests", "POST", this.get('session.authToken'), {  goodcity_request: goodcityRequestParams })
          .then(data => {
            store.pushPayload(data);
          });
        }
    });
  },

  setupController(controller) {
    let order = this.store.peekRecord("designation", this.get("orderId"));
    let user = order.get('createdBy');
    let organisation = user.get('organisationsUsers.firstObject.organisation');
    let orderUserOrganisation = { orderUserOrganisation: { user, organisation, order } };
    controller.set("model", orderUserOrganisation);
  },

  deactivate() {
    this.controllerFor('application').set('showSidebar', true);
  }
});
