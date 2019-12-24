import $ from "jquery";
import { later, cancel } from "@ember/runloop";
import { inject as service } from "@ember/service";
import Component from "@ember/component";
import loading from "../templates/loading";

export default Component.extend({
  layout: loading,
  classNames: ["loading-indicator"],
  messageBox: service(),
  logger: service(),
  i18n: service(),
  timer: null,

  didInsertElement() {
    var timer = later(() => {
      this.get("logger").error(
        new Error(this.get("i18n").t("loading_timeout_error"))
      );
      this.get("messageBox").alert(
        this.get("i18n").t("loading_timeout"),
        () => {
          this.destroy();
          window.location.reload();
        }
      );
    }, 3000000);

    this.set("timer", timer);
    $(document).on("cancel-loading-timer", () => cancel(timer));
  },

  willDestroyElement() {
    cancel(this.get("timer"));
    $(document).off("cancel-loading-timer");
  }
});
