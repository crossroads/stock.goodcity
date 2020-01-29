import { computed } from "@ember/object";
import AuthorizeRoute from "./../authorize";
import AjaxPromise from "stock/utils/ajax-promise"; //jshint ignore:line
import _ from "lodash";

export default AuthorizeRoute.extend({
  queryParams: {
    itemSetId: "",
    searchInput: ""
  },

  designateFullSet: computed.localStorage(),
  partial_qnty: computed.localStorage(),

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
      let data = await new AjaxPromise(
        "/auth/current_user_profile",
        "GET",
        this.session.get("authToken")
      );
      this.store.pushPayload(data);
    }
  },

  setupController(controller, model = {}) {
    this._super(controller, model);
    this.set("designateFullSet", false);
    this.set("partial_qnty", 0);
    controller.set("itemSetId", this.paramsFor("items.index").itemSetId);
    controller.on();
  },
  /* jshint ignore:end */

  afterModel() {
    this.set("partial_qnty", 0);
    this.set("designateFullSet", false);
  },

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.off();
    }
  }
});
