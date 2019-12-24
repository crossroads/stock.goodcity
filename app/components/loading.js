import Ember from "ember";
import loading from "../templates/loading";

export default Ember.Component.extend({
  layout: loading,
  classNames: ["loading-indicator"],
  messageBox: Ember.inject.service(),
  logger: Ember.inject.service(),
  intl: Ember.inject.service(),
  timer: null,

  didInsertElement() {
    var timer = Ember.run.later(() => {
      this.get("logger").error(
        new Error(this.get("intl").t("loading_timeout_error"))
      );
      this.get("messageBox").alert(
        this.get("intl").t("loading_timeout"),
        () => {
          this.destroy();
          window.location.reload();
        }
      );
    }, 3000000);

    this.set("timer", timer);
    Ember.$(document).on("cancel-loading-timer", () => Ember.run.cancel(timer));
  },

  willDestroyElement() {
    Ember.run.cancel(this.get("timer"));
    Ember.$(document).off("cancel-loading-timer");
  }
});
