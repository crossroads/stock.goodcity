import AuthorizeRoute from './../authorize';
import Ember from 'ember';

export default AuthorizeRoute.extend({
  partialUndesignateBackLinkpath: Ember.computed.localStorage(),

  beforeModel() {
    this._super(...arguments);
    var previousRoutes = this.router.router.currentHandlerInfos;
    var previousRoute = previousRoutes && previousRoutes.pop();

    if(previousRoute) {
      var routeName = previousRoute.name;
      var backLinkPath = "items.detail";

      if(routeName === "items"){
        backLinkPath = "items.index";
      }

      this.set("partialUndesignateBackLinkpath", backLinkPath);
    }
  },

  model(params) {
    var item = this.store.peekRecord("item", params.item_id) || this.store.findRecord('item', params.item_id);
    return item;
  },

  afterModel(model) {
    var designation;

    if(model) {
      model.get('ordersPackages').forEach( orderPackage => {
        var orderId = orderPackage.get('designationId');
        if(orderId) {
          designation = this.store.peekRecord("designation", orderId) || this.store.findRecord("designation", orderId);
        }
      });
    }
  },

  setupController(controller, model){
    this._super(controller, model);
    controller.set('partialUndesignateBackLinkpath', this.get('partialUndesignateBackLinkpath'));
  }
});
