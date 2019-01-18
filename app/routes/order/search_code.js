import AuthorizeRoute from './../authorize';

export default AuthorizeRoute.extend({

  model(params) {
    var orderId = params.order_id;
    return this.store.peekRecord('designation', orderId) || this.store.findRecord('designation', orderId);
  },

  setupController(controller, model){
    this._super(controller, model);
  },

  renderTemplate: function(controller) {
    this.render('search_code', {controller: controller});
  }

});
