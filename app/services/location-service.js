import Ember from "ember";
import ApiBaseService from "./api-base-service";
import NavigationAwareness from "../mixins/navigation_aware";
import _ from "lodash";
import { toID } from "../utils/helpers";

/**
 * Location Service
 *
 * @description Find and pick locations
 *
 */
export default ApiBaseService.extend(NavigationAwareness, {
  store: Ember.inject.service(),
  intl: Ember.inject.service(),

  init() {
    this._super(...arguments);
    this.set("openLocationSearch", false);
  },

  onNavigation() {
    this.getWithDefault("onLocationSelected", _.noop)(null);
  },

  async movePackage(pkg, opts = {}) {
    const { from, to, quantity } = opts;

    const payload = await this.PUT(`/packages/${pkg.get("id")}/move`, {
      quantity: quantity,
      from: toID(from),
      to: toID(to)
    });

    this.get("store").pushPayload(payload);

    return this.get("store").peekRecord("item", pkg.get("id"));
  },

  /**
   * Triggers the location selection popup, and resolves the promise
   * once a location has been selected.
   *
   * null is returned if the user closes the UI
   *
   * @returns {Promise<Model>}
   */
  userPickLocation(opts = {}) {
    const deferred = Ember.RSVP.defer();

    Ember.run(() => {
      this.set("locationSearchOptions", opts);
      this.set("openLocationSearch", true);
      this.set("onLocationSelected", order => {
        this.set("onLocationSelected", _.noop);
        this.set("openLocationSearch", false);
        deferred.resolve(order || null);
      });
    });

    return deferred.promise;
  }
});
