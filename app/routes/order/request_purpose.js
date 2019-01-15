import Ember from "ember";
import orderUserOrganisation from './order_user_organisation';

export default orderUserOrganisation.extend({
  async model(params) {
    let orderUserOrganisation = await this._super(...arguments);
    let districts = this.store.query('district', {});
    this.store.pushPayload(districts);

    return Ember.RSVP.hash({
      orderUserOrganisation,
      districts
    });
  }

});
