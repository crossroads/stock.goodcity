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
    controller.onStartup();
  },
  /* jshint ignore:end */

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set("preload", undefined);
    }
  }
});
