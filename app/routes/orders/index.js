import AuthorizeRoute from "./../authorize";
import Ember from "ember";
import AjaxPromise from "stock/utils/ajax-promise"; //jshint ignore:line
import _ from "lodash";
import { STATE_FILTERS } from "../../services/filter-service";

export default AuthorizeRoute.extend({
  filterService: Ember.inject.service(),
  utilityMethods: Ember.inject.service(),

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
    controller.onStartup();
  }
  /* jshint ignore:end */
});
