import Ember from "ember";

export default Ember.Component.extend({
  classNames: "",
  isPackageOffer: true,

  actions: {
    removeOffer(offer) {
      this.get("removeOffer")(offer);
    }
  }
});
