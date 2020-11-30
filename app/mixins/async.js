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
 * Presets of configs for runTask()
 *
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
  },
  SILENT_DEPENDENCY: {
    showSpinner: false,
    errorStrategy: ERROR_STRATEGIES.MODAL
  }
};

export default Ember.Mixin.create({
  logger: Ember.inject.service(),
  messageBox: Ember.inject.service(),
  i18n: Ember.inject.service(),

  ERROR_STRATEGIES,

  // ----------------------
  // Private Helpers
  // ----------------------

  __tasksCount: 0,
  __loadingView: null,
  __modalActive: false,

  __incrementTaskCount(step = 1) {
    const count = this.get("__tasksCount") + step;

    this.set("__tasksCount", _.clamp(count, 0, Infinity));

    if (this.get("hasRunningTasks")) {
      this.showLoadingSpinner();
    } else {
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

  // ----------------------
  // Mixin computed props
  // ----------------------

  hasRunningTasks: Ember.computed("__tasksCount", function() {
    return this.get("__tasksCount") > 0;
  }),

  // ----------------------
  // Mixin api
  // ----------------------

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

  tryTranslate(str, props = {}) {
    const i18n = this.get("i18n");
    return i18n.exists(str) ? i18n.t(str, props) : str;
  },

  modalAlert(key, props = {}) {
    const deferred = Ember.RSVP.defer();
    const text = this.tryTranslate(key, props);

    this.get("messageBox").alert(text, () => {
      deferred.resolve(null);
    });

    return deferred.promise;
  },

  modalConfirm(bodyText, confirmText = "confirm", cb = _.noop) {
    const deferred = Ember.RSVP.defer();

    const onConfirm = () => {
      cb();
      deferred.resolve(true);
    };

    const onCancel = () => deferred.resolve(false);

    this.get("messageBox").custom(
      this.tryTranslate(bodyText),
      this.tryTranslate(confirmText),
      onConfirm,
      this.tryTranslate("cancel"),
      onCancel
    );

    return deferred.promise;
  }
});
