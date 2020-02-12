import Ember from "ember";
import ApiBaseService from "./api-base-service";
import NavigationAwareness from "stock/mixins/navigation_aware";
import _ from "lodash";

export default ApiBaseService.extend(NavigationAwareness, {
  init() {
    this._super(...arguments);
    this.set("openOfferSearch", false);
  },

  getOffer() {
    const deferred = Ember.RSVP.defer();

    this.set("openOfferSearch", true);
    this.set("displayResults", true);
    this.set("onOfferSelected", offer => {
      this.set("onOfferSelected", _.noop);
      this.set("openOfferSearch", false);
      deferred.resolve(offer || null);
    });

    return deferred.promise;
  }
});
