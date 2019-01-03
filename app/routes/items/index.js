import AuthorizeRoute from './../authorize';
import Ember from 'ember';
import AjaxPromise from 'stock/utils/ajax-promise';

export default AuthorizeRoute.extend({

  queryParams: {
    itemSetId: "",
    searchInput: ""
  },
  designateFullSet: Ember.computed.localStorage(),

  partial_qnty: Ember.computed.localStorage(),

  model() {
    return new AjaxPromise("/auth/current_user_profile", "GET", this.session.get("authToken"))
      .then(data => {
        this.store.pushPayload(data);
      });
  },

  afterModel() {
    this.set('partial_qnty', 0);
    this.set('designateFullSet', false);
  },

  setupController(controller, model){
    this._super(controller, model);
    this.set('designateFullSet', false);
    this.set('partial_qnty', 0);
    this._super(controller, model);
    controller.set('itemSetId', this.paramsFor('items.index').itemSetId);
  }
});
