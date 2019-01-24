import detail from './detail';
import Ember from 'ember';

export default detail.extend({
  model(params){
    var designation = this.store.peekRecord("designation", params.order_id, {
      reload: true }) || this.store.findRecord('designation', params.order_id)
    return Ember.RSVP.hash({
      designation: designation,
      messages: this.store.query('message', { order_id: params.order_id })
    });
  },

  afterModel(model) {
    //Overriding to neglect afterModel in detail
  },

  setupController(controller, model) {
    // controller.set("messages", model.messages);
    controller.set("model", model.designation)
  }
});
