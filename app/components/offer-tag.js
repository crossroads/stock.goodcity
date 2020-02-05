import Ember from "ember";

export default Ember.Component.extend({
  classNames: ["offer-tag"],

  actions: {
    removeOffer(offer) {
      this.get("removeOffer")(offer);
    }
  }
});