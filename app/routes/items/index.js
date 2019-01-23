import AuthorizeRoute from './../authorize';
import Ember from 'ember';
import AjaxPromise from 'stock/utils/ajax-promise'; //jshint ignore:line
import _ from 'lodash';

export default AuthorizeRoute.extend({
  queryParams: {
    itemSetId: "",
    searchInput: "",
    locationFilterChanged: false
  },
  designateFullSet: Ember.computed.localStorage(),
  partial_qnty: Ember.computed.localStorage(),

  previousPage(transition) {
    const prevPage = _.last(_.get(transition, 'router.currentHandlerInfos'));
    return _.get(prevPage, 'name', '');
  },

  isBackNavigation(transition) {
    return /^items\..+$/.test(this.previousPage(transition));
  },

  hasModifiedFilters(transition) {
    return this.previousPage(transition) === "item_filters" || transition.queryParams.locationFilterChanged === "true";
  },

  /* jshint ignore:start */
  async model(params, transition) {

    if (this.isBackNavigation(transition)) {
      // When returning from the order details back to the search
      // we restore the state exactly as it was before
      return;
    }
    if(!this.session.get("currentUser")) {
      let data = await new AjaxPromise("/auth/current_user_profile", "GET", this.session.get("authToken"));
      this.store.pushPayload(data);
    }

    return Ember.RSVP.hash({
      hasModifiedFilters: this.hasModifiedFilters(transition)
    });
  },

  setupController(controller, model = {}) {
    this._super(controller, model);
    this.set('designateFullSet', false);
    this.set('partial_qnty', 0);

    const { hasModifiedFilters } = model;
    if (hasModifiedFilters) {
      controller.onFilterChange();
    }
    controller.set('itemSetId', this.paramsFor('items.index').itemSetId);
  },
  /* jshint ignore:end */

  afterModel() {
    this.set('partial_qnty', 0);
    this.set('designateFullSet', false);
  }
});
