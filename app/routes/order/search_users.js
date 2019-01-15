import AuthorizeRoute from './../authorize';
import AjaxPromise from 'stock/utils/ajax-promise';

export default AuthorizeRoute.extend({

  model(params) {
    let orderId = params.order_id;
    let order = this.store.peekRecord('designation', orderId) || this.store.findRecord('designation', orderId);
    return Ember.RSVP.hash({
      order,
      recentUsers: new AjaxPromise("/recent_users", "GET", this.session.get("authToken"))
    });
  },

  setupController(controller, model){
    this._super(controller, model);
    this.get("store").pushPayload(model.recentUsers);
    let users = [];
    model.recentUsers.users.forEach( (user) => {
      let userObject = this.store.peekRecord('user', user.id);
      user.organisations_users_ids.forEach( (org_user_id) => {
        let organisationsUser = controller.findOrganisationsUser(org_user_id);
        this.store.pushPayload(organisationsUser)
      });
      users.push(userObject);
    });

    controller.set("filteredResults", users);
  }
});
