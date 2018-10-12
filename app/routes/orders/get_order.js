import AuthorizeRoute from './../authorize';

export default AuthorizeRoute.extend({

  model(params) {
    return (this.store.peekRecord("designation", params.order_id, { reload: true }) || this.store.findRecord("designation", params.order_id, { reload: true }));
  }
});
