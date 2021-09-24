import Ember from "ember";
import config from "stock/config/environment";
import AjaxPromise from "stock/utils/ajax-promise";

export default Ember.Controller.extend({
  timer: config.APP.ACCESS_PASS_VALIDITY,
  messageBox: Ember.inject.service(),
  i18n: Ember.inject.service(),
  counter: 1,

  timerFunction() {
    if (
      (this.session.router.currentPath == "access_pass" &&
        this.get("counter") === 1) ||
      this.session.router.currentPath == "display_access_pass"
    ) {
      let waitTime = this.get("timer");
      if (waitTime === 0) {
        if (this.get("counter") >= 60) {
          this.alertPassExipred();
        } else {
          this.resetTimerParameters();
          return false;
        }
      }
      this.set("timer", waitTime - 1);

      setTimeout(() => {
        this.timerFunction();
      }, 1000);
    }
  },

  resetTimerParameters() {
    this.incrementCounter();
    this.set("timer", config.APP.ACCESS_PASS_VALIDITY);
    this.getRefreshedAccessPass(this.get("code"));
  },

  incrementCounter() {
    const counter = this.get("counter");
    this.set("counter", counter + 1);
  },

  getRefreshedAccessPass(code) {
    const accessPass = this.get("store")
      .peekAll("access_pass")
      .findBy("accessKey", code);

    if (accessPass) {
      this.requestRefreshedAccessPass(accessPass);
    } else {
      this.alertPassExipred();
    }
  },

  alertPassExipred() {
    this.get("messageBox").custom(
      this.get("i18n").t("access_form.pass_expired"),
      this.get("i18n").t("access_form.not_now"),
      () => this.send("redirectToMenuPage"),
      this.get("i18n").t("access_form.create_pass"),
      () => this.send("redirectToAccessPassForm")
    );
  },

  requestRefreshedAccessPass(accessPass) {
    new AjaxPromise(
      `/access_passes/${accessPass.get("id")}/refresh`,
      "PUT",
      this.get("session.authToken"),
      {}
    ).then(data => {
      this.get("store").pushPayload(data);
      this.set("code", data.access_pass.access_key);
      this.timerFunction();
    });
  },

  actions: {
    redirectToAccessPassForm() {
      this.transitionToRoute("access_pass");
    },

    redirectToMenuPage() {
      this.transitionToRoute("app_menu_list");
    }
  }
});
