import Ember from 'ember';
import AuthorizeRoute from './../authorize';

export default AuthorizeRoute.extend({

  async model(params) {
    var orderId = params.order_id;
    let order = this.store.peekRecord('designation', orderId) || await this.store.findRecord('designation', parseInt(orderId));
    let user = order.get('createdBy');
    let organisationsUser = user.get('organisationsUsers.firstObject');
    let organisation = organisationsUser.get('organisation');

    return Ember.RSVP.hash({
      user,
      organisation,
      order,
      organisationsUser
    });
  }

});
