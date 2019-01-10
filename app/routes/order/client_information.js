import Ember from 'ember';
import AuthorizeRoute from './../authorize';

export default AuthorizeRoute.extend({
  previousRouteName: null,

  model(params) {
    var orderId = params.order_id;
    var order = this.store.peekRecord('designation', orderId) || this.store.findRecord('designation', orderId);

    return Ember.RSVP.hash({
      order: order,
      beneficiary: order.get('beneficiary')
    });
  },

  setUpFormData(model, controller) {
    var selectedId = "hkId";
    var beneficiary = model.beneficiary;
    controller.set('isEditing', false);
    if(beneficiary){
      var phoneNumber = beneficiary.get('phoneNumber').slice(4);
      selectedId = beneficiary.get('identityTypeId') === 1 ? "hkId" : "abcl";
      controller.set('firstName', beneficiary.get('firstName'));
      controller.set('lastName', beneficiary.get('lastName'));
      controller.set('mobilePhone', phoneNumber);
      controller.set('identityNumber', beneficiary.get('identityNumber'));
    }
    controller.set('selectedId', selectedId);
    controller.set('isEditing', true);
  },

  setupController(controller, model) {
    this._super(...arguments);
    this.setUpFormData(model, controller);
    // controller.set("previousRouteName", this.get("previousRouteName"));
    // if(this.get("previousRouteName") === "my_orders") {
    //   this.controllerFor('my_orders').set("selectedOrder", model.order);
    // } else {
    //   this.controllerFor('my_orders').set("selectedOrder", null);
    // }
    this.controllerFor('application').set('showSidebar', false);
  },

  deactivate(){
    this.controllerFor('application').set('showSidebar', true);
  }
});
