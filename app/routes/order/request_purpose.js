import AuthorizeRoute from './../authorize';
import Ember from "ember";

export default AuthorizeRoute.extend({
  model(params) {
    let store = this.store;
    let user = store.peekRecord('user', params.userId) || store.findRecord('user', params.userId);
    let orgId = user.get('organisationsUsers.firstObject.organisationId');
    let organisation = store.peekRecord('organisation', orgId);
    let order = store.peekRecord('designation', params.order_id) || store.findRecord('designation', params.order_id);
    let districts = store.query('district', {});
    store.pushPayload(districts);

    return Ember.RSVP.hash({
      user,
      organisation,
      order
    });
  }

});
