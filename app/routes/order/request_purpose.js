import { hash } from "rsvp"; // jshint ignore:line
import orderUserOrganisation from "./order_user_organisation";

export default orderUserOrganisation.extend({
  /* jshint ignore:start */
  async model() {
    let orderUserOrganisation = await this._super(...arguments);
    let districts = this.store.query("district", {});
    this.store.pushPayload(districts);

    return hash({
      orderUserOrganisation,
      districts
    });
  }
  /* jshint ignore:end */
});
