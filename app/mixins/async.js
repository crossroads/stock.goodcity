import Ember from "ember";
import _ from "lodash";

const { getOwner } = Ember;

const getString = (obj, path) => {
  const val = _.get(obj, path);
  return val && _.isString(val) ? val : null;
};

/**
 * AsyncMixin
 *
 * @description utilities to run asynchronous tasks with spinner and error management features
 * @mixin AsyncMixin
 *
 **/

/**
 * @enum {number}
 * @readonly
 * @memberof AsyncMixin
 * @static
 */
export const ERROR_STRATEGIES = {
  /** Will ignore errors */
  IGNORE: 1,
  /** Will display the error message in a modal */
  MODAL: 2,
  /** Will let the error go through */
  RAISE: 3,
  /** Will push the error to rollbar */
  ROLLBAR: 4
};

/**
 * @enum {number}
 * @readonly
 * @memberof AsyncMixin
 * @static
 */
export const ASYNC_BEHAVIOURS = {
  DISCREET: {
    showSpinner: false,
    errorStrategy: ERROR_STRATEGIES.ROLLBAR
  },
  LOUD: {
    showSpinner: true,
    errorStrategy: ERROR_STRATEGIES.MODAL
  }
};

export default Ember.Mixin.create({
  logger: Ember.inject.service(),
  messageBox: Ember.inject.service(),
  i18n: Ember.inject.service(),

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
    return Ember.RSVP.resolve(res);
  },

  __handleError(err, errorStrategy = ERROR_STRATEGIES.RAISE) {
    if (errorStrategy === ERROR_STRATEGIES.RAISE) {
      return Ember.RSVP.reject(err);
    }

    if (errorStrategy === ERROR_STRATEGIES.MODAL) {
      return this.showErrorPopup(err);
    }

    if (errorStrategy === ERROR_STRATEGIES.ROLLBAR) {
      const errData = this.__toErrorSummary(err);
      this.get("logger").notifyErrorCollector(errData);
      console.error(errData);
      return;
    }
  },

  __toErrorSummary(error) {
    if (_.isString(error)) {
      return { message: error, details: {} };
    }

    return {
      message: this.__toErrorMessage(error),
      details: _.isError(error) ? { stack: error.stack } : error
    };
  },

  __toErrorMessage(reason) {
    const defaultMessage = this.get("i18n").t("unexpected_error");

    if (reason && reason.responseJSON) {
      reason = reason.responseJSON;
    }

    if (_.isString(reason)) {
      return reason;
    }

    return (
      getString(reason, "error") ||
      getString(reason, "errors[0].message") ||
      getString(reason, "errors[0].detail.message") ||
      getString(reason, "errors[0].title") ||
      getString(reason, "errors[0]") ||
      getString(reason, "message") ||
      defaultMessage
    );
  },

  // --- Mixin api

  /**
   * Runs the asynchronous task, showing and hiding loading spinners accordingly
   *
   * @memberof AsyncMixin
   * @instance
   * @param {Promise|Function} task the job to run
   * @param {number} [opts|errorStrategy] an indicator of how to handle the error
   */
  async runTask(task, opts = {}) {
    if (_.isNumber(opts)) {
      opts = { errorStrategy: opts };
    }

    const { errorStrategy, showSpinner = true } = opts;

    this.__incrementTaskCount(showSpinner ? 1 : 0);
    try {
      return await this.__run(task);
    } catch (err) {
      return this.__handleError(err, errorStrategy);
    } finally {
      this.__incrementTaskCount(showSpinner ? -1 : 0);
    }
  },

  showLoadingSpinner() {
    Ember.run(() => {
      if (!this.__loadingView && !Ember.testing) {
        this.__loadingView = getOwner(this)
          .factoryFor("component:loading")
          .create()
          .append();
      }
    });
  },

  hideLoadingSpinner() {
    Ember.run(() => {
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

  modalAlert(key, cb = _.noop) {
    const i18n = this.get("i18n");
    const text = i18n.exists(key) ? i18n.t(key) : key;

    this.get("messageBox").alert(text, cb);
  }
});
