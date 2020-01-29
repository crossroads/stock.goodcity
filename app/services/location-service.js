import { run } from "@ember/runloop";
import { defer } from "rsvp";
import { inject as service } from "@ember/service";
import ApiBaseService from "./api-base-service";
import NavigationAwareness from "../mixins/navigation_aware";
import _ from "lodash";
import { toID } from "../utils/helpers";

/**
 * Location Service
 *
 * @module Services/LocationService
 * @augments Services/ApiBaseService
 * @description Find and pick locations
 *
 */
export default ApiBaseService.extend(NavigationAwareness, {
  store: service(),
  i18n: service(),

  init() {
    this._super(...arguments);
    this.set("openLocationSearch", false);
  },

  onNavigation() {
    this.getWithDefault("onLocationSelected", _.noop)(null);
  },

  /**
   * Moves a package to the specified location
   *
   * @param {Package} pkg the package to move
   * @param {object} opts the move properties
   * @param {Location|string} opts.from the source location or its id
   * @param {Location|string} opts.to the destination location or its id
   * @param {quantity} opts.to the quantity to move
   * @returns {Promise<Model>}
   */
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
   * @param {object} opts searcg iotuibs
   * @returns {Promise<Model>}
   */
  userPickLocation(opts = {}) {
    const deferred = defer();

    run(() => {
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
