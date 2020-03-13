import Ember from "ember";

export default Ember.Component.extend({
  classNames: ["offer-tag"],
  isPackageOffer: true,

  actions: {
    removeOffer(offer) {
      this.get("removeOffer")(offer);
    }
  }
});
