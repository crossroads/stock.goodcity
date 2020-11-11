import Ember from "ember";
import AuthorizeRoute from "./../authorize";
import { INTERNATIONAL_ORDERS } from "stock/constants/state-events";

export default AuthorizeRoute.extend({
  orderService: Ember.inject.service(),

  async setupController(controller, model) {
    this._super(controller, model);
    const { code } = await this.get("orderService").getNextCode(
      INTERNATIONAL_ORDERS.SHIPMENT
    );
    controller.set("prefix", code[0]);
    controller.set("shipmentOrCarryoutCode", code.substr(1));
  }
});
