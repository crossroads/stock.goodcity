import Ember from "ember";
import config from "../config/environment";
const { getOwner } = Ember;
import AjaxPromise from "stock/utils/ajax-promise";
import createInventroyAction from "stock/mixins/create_Inventory";

export default Ember.Controller.extend(createInventroyAction, {
  application: Ember.inject.controller(),
  isMobileApp: config.cordova.enabled,
  stockAppVersion: Ember.computed(function() {
    return config.cordova.enabled ? config.APP.VERSION : null;
  }),

  getCurrentUser: Ember.computed(function() {
    var store = this.get("store");
    var currentUser = store.peekAll("user_profile").get("firstObject") || null;
    return currentUser;
  }).volatile(),

  orderParams() {
    let orderParams = {};
    orderParams.booking_type_id = this.store
      .peekAll("bookingType")
      .filterBy("identifier", "appointment")
      .get("firstObject.id");
    orderParams.submitted_by_id = this.get("getCurrentUser.id");
    orderParams.state = "draft";
    orderParams.detail_type = "GoodCity";
    return orderParams;
  },

  actions: {
    logMeOut() {
      this.get("application").send("logMeOut");
    },

    createOrder() {
      let loadingView = getOwner(this)
        .lookup("component:loading")
        .append();

      new AjaxPromise("/orders", "POST", this.get("session.authToken"), {
        order: this.orderParams()
      })
        .then(data => {
          let orderId = data.designation.id;
          this.store.pushPayload(data);
          this.transitionToRoute("order.search_users", orderId);
        })
        .finally(() => loadingView.destroy());
    }
  }
});
