import ApiBaseService from "./api-base-service";

export default ApiBaseService.extend({
  init() {
    this._super(...arguments);
    this.set("openOfferSearch", false);
  },

  fetchOffer() {
    this.set("openOfferSearch", true);
    this.set("displayResults", true);
  }
});
