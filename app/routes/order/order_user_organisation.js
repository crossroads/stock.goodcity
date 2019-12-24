import $ from "jquery"; // jshint ignore:line
import { hash } from "rsvp";
import AuthorizeRoute from "./../authorize";

export default AuthorizeRoute.extend({
  /* jshint ignore:start */
  async model(params) {
    let orderId = params.order_id;
    let order =
      this.store.peekRecord("designation", orderId) ||
      (await this.store.findRecord("designation", parseInt(orderId)));
    let user = order.get("createdBy");
    let organisationsUser = user.get("organisationsUsers.firstObject");
    let organisation = organisationsUser.get("organisation");

    return hash({
      user,
      organisation,
      order,
      organisationsUser
    });
  },
  /* jshint ignore:end */

  afterModel() {
    // Refer: for nested route issue for not scrolling at top of the page
    // https://github.com/dollarshaveclub/ember-router-scroll.
    $("body").animate({ scrollTop: 0 });
  }
});
