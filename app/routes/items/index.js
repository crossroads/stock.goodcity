import AuthorizeRoute from "./../authorize";
import Ember from "ember";
import AjaxPromise from "stock/utils/ajax-promise"; //jshint ignore:line
import _ from "lodash";

export default AuthorizeRoute.extend({
  queryParams: {
    itemSetId: "",
    searchInput: ""
  },
  userService: Ember.inject.service(),
  partial_qnty: Ember.computed.localStorage(),

  previousPage(transition) {
    const prevPage = _.last(_.get(transition, "router.currentHandlerInfos"));
    return _.get(prevPage, "name", "");
  },

  isBackNavigation(transition) {
    return /^items\..+$/.test(this.previousPage(transition));
  },

  /* jshint ignore:start */
  async model(params, transition) {
    if (this.isBackNavigation(transition)) {
      // When returning from the order details back to the search
      // we restore the state exactly as it was before
      return;
    }
    if (!this.session.get("currentUser")) {
      let data = await this.get("userService").currentUser();
      this.store.pushPayload(data);
    }
  },

  setupController(controller, model = {}) {
    this._super(controller, model);
    this.set("partial_qnty", 0);
    controller.set("itemSetId", this.paramsFor("items.index").itemSetId);
    controller.on();
  },
  /* jshint ignore:end */

  afterModel() {
    this.set("partial_qnty", 0);
  },

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.off();
    }
  }
});
