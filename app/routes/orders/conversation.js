import getOrderRoute from './get_order';
import Ember from 'ember';

export default getOrderRoute.extend({
  model(params){
    var designation = this.store.peekRecord("designation", params.order_id, {
      reload: true }) || this.store.findRecord('designation', params.order_id)
    return Ember.RSVP.hash({
      designation: designation,
      messages: this.store.query('message', {
        order_id: designation.id
      })
    });
  },
  afterModel(model){
    var organisation;
    debugger
    if (model) {
      var organisationId = model.designation.data.gcOrganisationId;
      var ordersPackages = this.store.query("orders_package", {
        search_by_order_id: model.designation.id
      });
      if (organisationId) {
        debugger
        organisation = this.store.findRecord('gcOrganisation', organisationId);
        this.store.pushPayload(organisation);
      }
      debugger
      this.store.pushPayload(ordersPackages);
    }
  }
});


