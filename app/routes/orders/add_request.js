import getOrderRoute from './get_order';
import Ember from 'ember';

export default getOrderRoute.extend({
  model(params) {
    var order = this.store.peekRecord("designation", params.orderId);
    return Ember.RSVP.hash({
      order: order || this.store.findRecord('designation', params.orderId),
      codes: this.store.query('code', { stock: true })
    });
  }
});
