import AuthorizeRoute from './../authorize';

export default AuthorizeRoute.extend({
  model(params) {
    var orderId = params.order_id;
    return this.store.peekRecord('designation', orderId) || this.store.findRecord('designation', orderId);
  },

  setupController() {
    this._super(...arguments);
    this.controllerFor('application').set('showSidebar', false);
  },

  deactivate(){
    this.controllerFor('application').set('showSidebar', true);
  }
});
