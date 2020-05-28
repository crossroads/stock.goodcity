import Ember from "ember";

export default Ember.Component.extend({
  classNames: ["class"],
  isPackageOffer: true,

  actions: {
    removeOffer(offer) {
      this.get("removeOffer")(offer);
    }
  }
});
