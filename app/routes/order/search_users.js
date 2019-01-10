import AuthorizeRoute from './../authorize';

export default AuthorizeRoute.extend({

  model(params) {
    let orderId = params.order_id;
    return this.store.peekRecord('designation', orderId) || this.store.findRecord('designation', orderId);
  }
});
