import Ember from "ember";
import AjaxPromise from "./../utils/ajax-promise";
import config from "../config/environment";
import preloadDataMixin from "../mixins/preload_data";
import GoodcityController from "./goodcity_controller";
import _ from "lodash";
let timeout;

export default GoodcityController.extend(preloadDataMixin, {
  messageBox: Ember.inject.service(),
  authService: Ember.inject.service(),
  application: Ember.inject.controller(),
  attemptedTransition: null,
  pin: "",
  timer: config.APP.OTP_RESEND_TIME,
  pinAlreadySent: false,
  isMobileApp: config.cordova.enabled,

  mobile: Ember.computed("mobilePhone", function() {
    return config.APP.HK_COUNTRY_CODE + this.get("mobilePhone");
  }),

  timerFunction() {
    let waitTime = this.get("timer");
    if (waitTime === 0) {
      this.resetTimerParameters();
      return false;
    }
    this.set("timer", waitTime - 1);
    timeout = setTimeout(() => {
      this.timerFunction();
    }, 1000);
  },

  resetTimerParameters() {
    this.set("pinAlreadySent", false);
    this.set("timer", config.APP.OTP_RESEND_TIME);
  },

  actions: {
    authenticateUser() {
      let pin = this.get("pin");
      let otpAuthKey = this.get("session.otpAuthKey");
      Ember.$(".auth_error").hide();
      this.showLoadingSpinner();
      this.get("authService")
        .verify(pin, otpAuthKey)
        .then(({ jwt_token, user }) => {
          clearTimeout(timeout);
          this.resetTimerParameters();
          this.set("pin", null);
          this.set("session.authToken", jwt_token);
          this.set("session.otpAuthKey", null);
          this.store.pushPayload(user);
          Ember.run(() => this.get("application").send("setSubscription"));
          return this.preloadData();
        })
        .then(() => {
          let attemptedTransition = this.get("attemptedTransition");
          if (!attemptedTransition) {
            return this.transitionToRoute("/");
          }
          attemptedTransition.retry();
          this.set("attemptedTransition", null);
        })
        .catch(jqXHR => {
          Ember.$("#pin")
            .closest("div")
            .addClass("error");
          if (jqXHR.status === 422) {
            this.get("messageBox").alert(
              _.get(jqXHR, "responseJSON.errors.pin")
            );
          }
        })
        .finally(() => this.hideLoadingSpinner());
    },

    resendPin() {
      this.set("pinAlreadySent", true);
      this.showLoadingSpinner();
      this.get("authService")
        .sendPin(this.get("mobile"))
        .then(data => {
          this.set("session.otpAuthKey", data.otp_auth_key);
          this.set("pin", null);
          this.transitionToRoute("/authenticate");
          this.timerFunction();
        })
        .catch(error => {
          this.set("pinAlreadySent", false);
          if ([401].includes(error.status)) {
            this.get("messageBox").alert("You are not authorized.", () => {
              this.transitionToRoute("/");
            });
          } else if ([422, 403].includes(error.status)) {
            Ember.$("#mobile")
              .closest(".mobile")
              .addClass("error");
            return;
          }
          throw error;
        })
        .finally(() => this.hideLoadingSpinner());
    }
  }
});
