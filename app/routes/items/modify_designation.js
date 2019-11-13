import AuthorizeRoute from './../authorize';
import Ember from 'ember';

export default AuthorizeRoute.extend({

  queryParams: {
    ordersPackageId: false
  },
  ordersPackageId: null,

  model(params) {
    this.set("ordersPackageId", params.ordersPackageId);
    var item = this.store.peekRecord("item", params.item_id);
    var ordersPackage = this.store.peekRecord("orders_package", params.ordersPackageId);

    return Ember.RSVP.hash({
      item: item || this.store.findRecord('item', params.item_id),
      ordersPackage: ordersPackage || this.store.findRecord("orders_package", params.ordersPackageId)
    });
  },

  afterModel(model) {
    var ordersPkg = model.ordersPackage;
    var designationId = ordersPkg.get('designationId');

    if(designationId) {
      var designation =  this.store.peekRecord("designation", designationId) || this.store.findRecord("designation", designationId);
      return designation;
    }
  },

  setupController(controller, model){
    this._super(controller, model);
    controller.set("ordersPackageId", this.get("ordersPackageId"));
  }
});
