import Ember from 'ember';
import orderUserOrganisation from './order_user_organisation';

export default orderUserOrganisation.extend({
  async model() {
    let orderUserOrganisation = await this._super(...arguments);

    return Ember.RSVP.hash({
      orderUserOrganisation,
      beneficiary: orderUserOrganisation.order.get('beneficiary')
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
    this.controllerFor('application').set('showSidebar', false);
  },

  deactivate(){
    this.controllerFor('application').set('showSidebar', true);
  }
});
