import { inject as service } from "@ember/service";
import AuthorizeRoute from "./../authorize";
import AjaxPromise from "stock/utils/ajax-promise"; //jshint ignore:line
import _ from "lodash";
import { STATE_FILTERS } from "../../services/filter-service";

export default AuthorizeRoute.extend({
  filterService: service(),
  utilityMethods: service(),

  /* jshint ignore:start */
  async model(params, transition) {
    if (!this.session.get("currentUser")) {
      // @TODO: Move this user api call into the session service
      // Checking the user, if needed, should probably be in AuthorizeRoute
      let data = await new AjaxPromise(
        "/auth/current_user_profile",
        "GET",
        this.session.get("authToken")
      );
      this.store.pushPayload(data);
    }
  },

  async setupController(controller, model = {}) {
    await this._super(controller, model);
    controller.on();
  },
  /* jshint ignore:end */

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.off();
    }
  }
});
