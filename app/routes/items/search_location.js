import Ember from "ember";
import AuthorizeRoute from './../authorize';

export default AuthorizeRoute.extend({

  queryParams: {
    isSet: false
  },

  itemMoveBackLinkPath: Ember.computed.localStorage(),

  beforeModel() {
    var previousRoutes = this.router.router.currentHandlerInfos;
    var previousRoute = previousRoutes && previousRoutes.pop();

    var path = "items.index";

    if(previousRoute) {
      var routeName = previousRoute.name;
      if(routeName.indexOf("detail")){
        path = routeName;
      }
    }
    
    this.set("itemMoveBackLinkPath", path);
  },

  model(params) {
    var item = this.store.peekRecord("item", params.item_id);

    return Ember.RSVP.hash({
      item: item || this.store.findRecord('item', params.item_id),
      locations: this.store.query('location', { recently_used: true })
    });
  },

  setupController(controller, model){
    this._super(controller, model);
    controller.set('searchText', "");
    controller.set('backLinkPath', this.get('itemMoveBackLinkPath'));
  }
});
