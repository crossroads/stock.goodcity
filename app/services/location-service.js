import Ember from "ember";
import ApiBaseService from "./api-base-service";
import _ from "lodash";

/**
 * Location Service
 *
 * @description Find and pick locations
 *
 */
export default ApiBaseService.extend({
  store: Ember.inject.service(),

  init() {
    this._super(...arguments);
    this.set("openLocationSearch", false);
  },

  /**
   * Triggers the location selection popup, and resolves the promise
   * once a location has been selected.
   *
   * null is returned if the user closes the UI
   *
   * @returns {Promise<Model>}
   */
  userPickLocation(filters = {}) {
    const deferred = Ember.RSVP.defer();

    this.set("locationSearchProps", filters);
    this.set("openLocationSearch", true);
    this.set("onLocationSelected", order => {
      this.set("onLocationSelected", _.noop);
      deferred.resolve(order || null);
    });

    return deferred.promise;
  }
});
