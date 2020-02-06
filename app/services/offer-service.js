import Ember from "ember";
import ApiBaseService from "./api-base-service";
import NavigationAwareness from "stock/mixins/navigation_aware";
import _ from "lodash";

export default ApiBaseService.extend(Ember.Evented, NavigationAwareness, {
  init() {
    this._super(...arguments);
    this.set("openOfferSearch", false);
  },

  fetchOffer() {
    this.set("openOfferSearch", true);
    this.set("displayResults", true);
  },

  setOffer(offer) {
    this.set("onOfferSelected", offer);
    this.trigger("onOfferSelect");
  }
});
