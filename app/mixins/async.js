import { run } from "@ember/runloop";
import { resolve, reject } from "rsvp";
import { inject as service } from "@ember/service";
import Mixin from "@ember/object/mixin";
import { getOwner } from "@ember/application";
import Ember from "ember";
import _ from "lodash";

const getString = (obj, path) => {
  const val = _.get(obj, path);
  return val && _.isString(val) ? val : null;
};

export const ERROR_STRATEGIES = {
  IGNORE: 1,
  MODAL: 2,
  RAISE: 3
};

export default Mixin.create({
  logger: service(),
  messageBox: service(),
  i18n: service(),

  ERROR_STRATEGIES,

  // ---- Helpers

  __tasksCount: 0,
  __loadingView: null,
  __modalActive: false,

  __incrementTaskCount(val = 1) {
    this.__tasksCount += val;
    if (this.__tasksCount > 0) {
      this.showLoadingSpinner();
    } else {
      this.__tasksCount = 0;
      this.hideLoadingSpinner();
    }
  },

  __run(task) {
    const res = typeof task === "function" ? task() : task;
    return resolve(res);
  },

  __handleError(err, errorStrategy = ERROR_STRATEGIES.RAISE) {
    if (errorStrategy === ERROR_STRATEGIES.RAISE) {
      return reject(err);
    }

    if (errorStrategy === ERROR_STRATEGIES.MODAL) {
      return this.showErrorPopup(err);
    }
  },

  __toErrorMessage(reason) {
    const defaultMessage = this.get("i18n").t("unexpected_error");

    if (reason && reason.responseJSON) {
      reason = reason.responseJSON;
    }

    return (
      getString(reason, "error") ||
      getString(reason, "message") ||
      getString(reason, "errors[0].detail.message") ||
      defaultMessage
    );
  },

  // --- Mixin api

  /**
   * Runs the asynchronous task, showing and hiding loading spinners accordingly
   *
   * @param {Promise|Function} task the job to run
   * @param {number} [errorStrategy] an indicator of how to handle the error
   */
  async runTask(task, errorStrategy) {
    this.__incrementTaskCount();
    try {
      return await this.__run(task);
    } catch (err) {
      return this.__handleError(err, errorStrategy);
    } finally {
      this.__incrementTaskCount(-1);
    }
  },

  showLoadingSpinner() {
    run(() => {
      if (!this.__loadingView && !Ember.testing) {
        this.__loadingView = getOwner(this)
          .factoryFor("component:loading")
          .create()
          .append();
      }
    });
  },

  hideLoadingSpinner() {
    run(() => {
      if (this.__loadingView && !Ember.testing) {
        this.__loadingView.destroy();
        this.__loadingView = null;
      }
    });
  },

  showErrorPopup(reason) {
    this.get("logger").error(reason);

    if (this.get("__modalActive")) {
      return;
    }

    this.set("__modalActive", true);
    this.get("messageBox").alert(this.__toErrorMessage(reason), () => {
      this.set("__modalActive", false);
    });
  },

  i18nAlert(key, cb) {
    this.get("messageBox").alert(this.get("i18n").t(key), cb);
  }
});
