import AuthorizeRoute from './../authorize';
import Ember from "ember";

export default AuthorizeRoute.extend({
  model(params) {
    let store = this.store;
    let user = store.peekRecord('user', params.userId);
    let orgId = user.get('organisationsUsers.firstObject.organisationId');
    let organisation = store.peekRecord('organisation', orgId);
    let order = this.store.peekRecord('order', params.order_id) || this.store.findRecord('designation', params.order_id);
    let districts = store.query('district', {});
    store.pushPayload(districts);

    return Ember.RSVP.hash({
      user,
      organisation,
      order
    });
  }

});
