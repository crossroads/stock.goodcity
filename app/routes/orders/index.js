import AuthorizeRoute from "./../authorize";
import Ember from "ember";
import AjaxPromise from "stock/utils/ajax-promise"; //jshint ignore:line
import _ from "lodash";

export default AuthorizeRoute.extend({
  filterService: Ember.inject.service(),
  utilityMethods: Ember.inject.service(),

  previousPage(transition) {
    const prevPage = _.last(_.get(transition, "router.currentHandlerInfos"));
    return _.get(prevPage, "name", "");
  },

  isBackNavigation(transition) {
    return /^orders\..+$/.test(this.previousPage(transition));
  },

  hasModifiedFilters(transition) {
    return this.previousPage(transition) === "order_filters";
  },

  // preloadData() {
  //   const utils = this.get("utilityMethods");
  //   const filterService = this.get('filterService');

  //   let filter = filterService.get('getOrderStateFilters');
  //   let typeFilter = filterService.get('getOrderTypeFilters');
  //   let isPriority = filterService.isPriority();
  //   if (isPriority) {
  //     filter.shift();
  //   }

  //   return this.store.query('designation', {
  //     state: utils.stringifyArray(filter),
  //     type: utils.stringifyArray(typeFilter),
  //     priority: isPriority
  //   });
  // },

  /* jshint ignore:start */
  async model(params, transition) {
    if (this.isBackNavigation(transition)) {
      // When returning from the order details back to the search
      // we restore the state exactly as it was before
      return;
    }

    if (!this.session.get("currentUser")) {
      let data = await new AjaxPromise(
        "/auth/current_user_profile",
        "GET",
        this.session.get("authToken")
      );
      this.store.pushPayload(data);
    }

    return Ember.RSVP.hash({
      hasModifiedFilters: this.hasModifiedFilters(transition),
      preloaded: params.preload ? this.preloadData() : null
    });
  },

  async setupController(controller, model = {}) {
    this._super(controller, model);

    // const { preloaded, hasModifiedFilters } = model;
    // if (preloaded) {
    //   preloaded.forEach(record => controller.onItemLoaded(record));
    //   controller.set("searchText", "");
    //   controller.set("filteredResults", preloaded);
    // } else if (hasModifiedFilters) {
    //   controller.onFilterChange();
    // }
    controller.onStartup();
  },
  /* jshint ignore:end */

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set("preload", undefined);
    }
  }
});
