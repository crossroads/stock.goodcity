import AuthorizeRoute from "./authorize";
import config from "stock/config/environment";

export default AuthorizeRoute.extend({
  queryParams: {
    code: ""
  },

  beforeModel(transition) {
    this._super(...arguments);

    const hasCode = !!transition.queryParams.code;

    if (!hasCode) {
      transition.abort();
      this.transitionTo("access_pass");
    }
  },

  setupController(controller, model) {
    this._super(controller, model);
    controller.set("counter", 1);
    controller.set("timer", config.APP.ACCESS_PASS_VALIDITY);
    controller.timerFunction();
  }
});
