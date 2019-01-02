import AuthorizeRoute from './../authorize';
import Ember from "ember";

export default AuthorizeRoute.extend({

  model(params) {
    return this.store.peekRecord('order', params.order_id);
  }
});
