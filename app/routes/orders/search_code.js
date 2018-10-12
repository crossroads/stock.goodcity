import searchCode from './../search_code';
import Ember from 'ember';

export default searchCode.extend({
  model(params) {
    var designation = this.store.peekRecord("designation", params.order_id);
    return Ember.RSVP.hash({
      designation: designation || this.store.findRecord('designation', params.order_id),
      codes: this.store.query('code', { stock: true })
    });
  },
});
