import Ember from "ember";
import AuthorizeRoute from "./../authorize";

export default AuthorizeRoute.extend({
  orderService: Ember.inject.service(),

  async model() {
    return {
      shipmentSubsequentCode: await this.get(
        "orderService"
      ).fetchShipmentorCarryoutCode("Shipment")
    };
  },

  setupController(controller, model) {
    this._super(controller, model);
    controller.set("shipmentorCarryoutCode", model.shipmentSubsequentCode);
  }
});
