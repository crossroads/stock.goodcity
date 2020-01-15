import Ember from "ember";
import RSVP from "rsvp";
import _ from "lodash";

/**
 * @module Controllers/GoodcityController
 * @augments ember/Controller
 * @description Generic controller base. Should hopefully help avoid re-writing code in the future
 *  <br> Has:
 *  <br> - Message box
 *  <br> - Loading spinner
 *  <br> - CRUD methods for controlling records
 */
export default Ember.Controller.extend({
  // ---- Services

  messageBox: Ember.inject.service(),
  i18n: Ember.inject.service(),

  init() {
    this._super();
  },

  // ---- Generic Helpers

  /**
   * @instance
   * @description displays the loading spinner on the screen
   */
  showLoadingSpinner() {
    if (Ember.testing) {
      return;
    }
    if (!this.loadingView) {
      this.loadingView = Ember.getOwner(this)
        .lookup("component:loading")
        .append();
    }
  },

  /**
   * @instance
   * @description hides the loading spinner off the screen
   */
  hideLoadingSpinner() {
    if (Ember.testing) {
      return;
    }
    if (this.loadingView) {
      this.loadingView.destroy();
      this.loadingView = null;
    }
  },

  showError(message, cb) {
    this.get("messageBox").alert(
      message || this.get("i18n").t("unexpected_error"),
      cb
    );
  },

  onError(response = {}) {
    const errors = _.map(response.errors, err =>
      _.isString(err) ? err : err.detail
    );
    this.showError(errors[0]);
  },

  // ---- CRUD

  createRecord(modelName, payload) {
    const newRecord = this.get("store").createRecord(modelName, payload);
    this.showLoadingSpinner();
    return newRecord
      .save()
      .catch(r => {
        this.onError(r);
      })
      .then(() => this.hideLoadingSpinner());
  },

  updateRecord(record, updates = {}, opts = {}) {
    _.each(updates, (v, k) => record.set(k, v));
    this.showLoadingSpinner();
    return record
      .save()
      .then(() => {
        _.get(opts, "onSuccess", _.noop)();
      })
      .catch(e => {
        if (!opts.noRollback) {
          record.rollbackAttributes();
        }
        _.get(opts, "onFailure", _.noop)(e);
        this.onError(e);
      })
      .finally(() => this.hideLoadingSpinner());
  },

  deleteRecords(records) {
    this.showLoadingSpinner();
    return RSVP.all(records.map(r => r.destroyRecord()))
      .catch(r => this.onError(r))
      .finally(() => this.hideLoadingSpinner());
  },

  back() {
    history.back();
  }
});
