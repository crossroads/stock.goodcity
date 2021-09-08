import Ember from "ember";
import config from "stock/config/environment";

export default Ember.Controller.extend({
  timer: config.APP.ACCESS_PASS_VALIDITY,

  timerFunction() {
    let waitTime = this.get("timer");
    if (waitTime === 0) {
      this.resetTimerParameters();
      return false;
    }
    this.set("timer", waitTime - 1);

    setTimeout(() => {
      this.timerFunction();
    }, 1000);
  },

  init() {
    this.timerFunction();
  },

  resetTimerParameters() {
    this.set("timer", config.APP.ACCESS_PASS_VALIDITY);
    this.timerFunction();
  },

  actions: {}
});
