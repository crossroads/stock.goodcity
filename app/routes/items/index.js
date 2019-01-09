import AuthorizeRoute from './../authorize';
import Ember from 'ember';
import AjaxPromise from 'stock/utils/ajax-promise'; //jshint ignore:line
import _ from 'lodash';

export default AuthorizeRoute.extend({

  filterService: Ember.inject.service(),
  utilityMethods: Ember.inject.service(),
  queryParams: {
    itemSetId: "",
    searchInput: "",
    preload: true
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
    return this.previousPage(transition) === "item_filters";
  },

  preloadData() {
    const utils = this.get("utilityMethods");
    const filterService = this.get('filterService');

    let statefilter = filterService.get('getItemStateFilters');
    let locationfilter = filterService.get('getItemLocationFilters');

    return this.store.query('package', {
      state: utils.stringifyArray(statefilter),
      location: locationfilter
    });
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
      hasModifiedFilters: this.hasModifiedFilters(transition),
      preloaded: params.preload ? this.preloadData() : null
    });
  },

  async setupController(controller, model = {}) {
    this._super(controller, model);
    this.set('designateFullSet', false);
    this.set('partial_qnty', 0);
    this._super(controller, model);
    const { preloaded, hasModifiedFilters } = model;
    if (preloaded) {
      preloaded.forEach(record => controller.onItemLoaded(record));
      controller.set("searchText", "");
      controller.set("filteredResults", preloaded);
    } else if (hasModifiedFilters) {
      controller.onFilterChange();
    }
    controller.set('itemSetId', this.paramsFor('items.index').itemSetId);
  },
  /* jshint ignore:end */

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('preload', undefined);
    }
  },

  model() {
    return new AjaxPromise("/auth/current_user_profile", "GET", this.session.get("authToken"))
      .then(data => {
        this.store.pushPayload(data);
      });
  },

  afterModel() {
    this.set('partial_qnty', 0);
    this.set('designateFullSet', false);
  }
});
