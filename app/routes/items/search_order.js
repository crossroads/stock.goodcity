import Ember from "ember";
import AuthorizeRoute from './../authorize';
const { getOwner } = Ember;

export default AuthorizeRoute.extend({

  queryParams: {
    showDispatchOverlay: false
  },

  partial_qnty: Ember.computed.localStorage(),
  messageBox: Ember.inject.service(),
  transition: null,

  partialDesignatePath: true,
  itemDesignateBackLinkPath: Ember.computed.localStorage(),

  beforeModel(transition) {
    getOwner(this).lookup('controller:items.detail').set('callOrderObserver', true);
    this._super(...arguments);
    this.set('transition', transition);
    var previousRoutes = this.router.router.currentHandlerInfos;
    var previousRoute = previousRoutes && previousRoutes.pop();

    var path = "items.index";

    if(previousRoute) {
      var routeName = previousRoute.name;
      if(routeName.indexOf("detail")){
        path = routeName;
      }
      if(routeName === "items.partial_designate") {
        path = "items.index";
        this.set('partialDesignatePath', true);
      } else {
        this.set('partialDesignatePath', false);
      }
    }
    if(parseInt(window.localStorage.getItem('partial_qnty'), 10)) {
      this.set('partialDesignatePath', true);
    } else {
      this.set('partialDesignatePath', false);
    }
    this.set("itemDesignateBackLinkPath", path);
  },

  model(params) {
    var item = this.store.peekRecord("item", params.item_id);
    var recentlyUsedDesignations = this.store.peekAll('designation').filterBy('recentlyUsedAt');
    recentlyUsedDesignations.forEach(record => {
        if(record.constructor.toString() === "stock@model:designation:") {
          this.store.query("orders_package", { search_by_order_id: record.get("id")
        });
      }
    });

    return Ember.RSVP.hash({
      item: item || this.store.findRecord('item', params.item_id),
      designations: recentlyUsedDesignations.get('length') !== 0 ? recentlyUsedDesignations : this.get('store').query('designation', { shallow: true, recently_used: true })
    });
  },

  afterModel(model) {
    if(model.item.get('quantity') === 0) {
      this.get('transition').abort();
      this.get("messageBox").alert("This item is already designated", () => {
        this.transitionTo("items.index");
      });
    }
  },

  setupController(controller, model){
    this._super(controller, model);
    if(!this.get('partialDesignatePath') && !parseInt(window.localStorage.getItem('partial_qnty'), 10)) {
      controller.set('notPartialRoute', true);
    } else {
      controller.set('notPartialRoute', false);
    }
    controller.set('searchText', "");
    controller.set('backLinkPath', this.get('itemDesignateBackLinkPath'));
  }
});
