import AuthorizeRoute from "./../authorize";
import Ember from "ember";
import AjaxPromise from "stock/utils/ajax-promise"; //jshint ignore:line
import _ from "lodash";
import { STATE_FILTERS } from "../../services/filter-service";

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

  firstLoad: true,
  hasModifiedFilters(transition) {
    if (this.firstLoad && this.get("filterService.hasOrderFilters")) {
      // Filters set during the previous session
      this.firstLoad = false;
      return true;
    }
    return this.previousPage(transition) === "order_filters";
  },

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
      hasModifiedFilters: this.hasModifiedFilters(transition)
    });
  },

  async setupController(controller, model = {}) {
    this._super(controller, model);

    // const { preloaded, hasModifiedFilters } = model;
    // if (preloaded) {
    //   // Display pre-loaded content
    //   controller.set("searchText", "");
    //   controller.set("filteredResults", preloaded);
    // } else if (hasModifiedFilters) {
    //   // Re-trigger the search after the filters have changed
    //   controller.onFilterChange({ force: true });
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
