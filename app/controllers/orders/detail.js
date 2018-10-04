import Ember from "ember";
import config from '../../config/environment';
import AjaxPromise from 'stock/utils/ajax-promise';
const { getOwner } = Ember;

export default Ember.Controller.extend({

  backLinkPath: "",
  displayAllItems: false,
  displayItemOptions: true,
  isMobileApp: config.cordova.enabled,
  itemIdforHistoryRoute: null,
  organisationIdforHistoryRoute: null,
  store: Ember.inject.service(),
  messageBox: Ember.inject.service(),
  i18n: Ember.inject.service(),
  appReview: Ember.inject.service(),
  isOrderProcessRestarted: false,
  isActiveGoods: false,

  displayOrderOptions: Ember.computed({
    get: function() {
      return false;
    },
    set: function(key, value) {
      return value;
    }
  }),

  ordersPackagesLengthMoreThenThree: Ember.observer('model.ordersPackages', function() {
    var ordersPackages = this.get("model.ordersPackages");
    ordersPackages.canonicalState.forEach(record => {
      if(record && record._data.state === "cancelled") {
          ordersPackages.canonicalState.removeObject(record);
      }
    });
    return (ordersPackages.canonicalState.length) >= 3 ? this.set("displayAllItems", false) : this.set("displayAllItems", true);
  }),

  itemsList: Ember.computed('model.items', 'displayAllItems', 'model.ordersPackages', 'model.ordersPackages.@each.quantity', 'model.ordersPackages.@each.state', function() {
    var ordersPackages =  this.get("model.ordersPackages").rejectBy('state', "requested").rejectBy("state", "cancelled").rejectBy('state', null);
    return this.get("displayAllItems") ? ordersPackages : ordersPackages.slice(0, 3);
  }),

  canceledItemsList: Ember.computed('model.items', 'displayAllItems', 'model.ordersPackages', 'model.ordersPackages.@each.quantity', 'model.ordersPackages.@each.state', function() {
    var ordersPackages =  this.get("model.ordersPackages").filterBy('state', "cancelled").rejectBy('state', null);
    return this.get("displayAllItems") ? ordersPackages : ordersPackages.slice(0, 3);
  }),

  ordersPkgLength: Ember.computed('model.items', 'displayAllItems', 'model.ordersPackages', 'model.ordersPackages.@each.quantity', 'model.ordersPackages.@each.state', function() {
    return this.get("model.ordersPackages").rejectBy('state', 'requested').rejectBy('state', null).length;
  }),

  genericCustomPopUp(message, button1text, button2text, btn1Callback) {
    var _this = this;
    _this.get("messageBox").custom(
      _this.get("i18n").t(message),
      _this.get("i18n").t(button1text),
      () => { btn1Callback(); },
      _this.get("i18n").t(button2text),
      () => { this.send("toggleDisplayOptions"); });
  },

  genericAlertPopUp(message, btn1Callback) {
    var _this = this;
    this.get("messageBox").alert(_this.get("i18n").t(message),
      () => { btn1Callback(); }
      );
  },

  //Should only be able to close if at least 1 item is dispatched and 0 is designated
  canCloseOrder(order) {
    let ordersPackages = order.get("ordersPackages");
    return (ordersPackages.filterBy('state', "dispatched").length > 0 && !ordersPackages.filterBy('state', 'description').length);
  },

  //Should only be able to cancel if at least 1 item is designated and 0 is dispatched
  canCancelOrder(order) {
    let ordersPackages = order.get("ordersPackages");
    return (ordersPackages.filterBy('state', 'designated').length > 0 && !ordersPackages.filterBy('state', 'dispatched').length);
  },

  actions: {
    toggleOrderOptions() {
      this.toggleProperty("displayOrderOptions");
    },

    displayAllItems() {
      this.set("displayAllItems", true);
    },

    updateOrder(order, actionName) {
      switch(actionName) {
        case "messagePopUp":
          this.send("changeOrderState", order, "cancel");
          break;
        case "start_processing":
          this.send("changeOrderState", order, actionName);
          break;
        case "resubmit":
          this.send("promptResubmitModel", order ,actionName);
          break;
        case "reopen":
          this.send("promptReopenModel", order, actionName);
          break;
        case "restart_process":
          this.send("promptRestartProcessModel", order, actionName);
          break;
        case "dispatch_later":
          this.send("dispatchLaterModel", order, actionName);
          break;
        case "cancel":
          this.send("promptCancelOrderModel", order, actionName);
          break;
        case "close":
          this.send("promptCloseOrderModel", order, actionName);
          break;
        default:
          this.send("changeOrderState", order, actionName);
      }
    },

    dispatchLaterModel(order, actionName) {
      var _this = this;
      if(!order.get('allDesignatedOrdersPackages')) {
        this.genericAlertPopUp("order_details.dispatch_later_undispatch_warning", function() { _this.send("toggleDisplayOptions"); });
      } else {
        this.genericCustomPopUp("order_details.dispatch_later_warning", "order.dispatch_later", "not_now", function() { _this.send("changeOrderState", order, actionName); });
      }
    },

    promptResubmitModel(order, actionName) {
      var _this = this;
      this.genericCustomPopUp("order_details.resubmit_order_warning", "order.resubmit", "not_now", function() { _this.send("changeOrderState", order, actionName); });
    },

    promptReopenModel(order, actionName) {
      var _this = this;
      this.genericCustomPopUp("order_details.reopen_warning", "order.reopen_order", "not_now", function() { _this.send("changeOrderState", order, actionName); });
    },

    toggleDisplayOptions() {
      if(this.get("displayOrderOptions")) {
        this.set("displayOrderOptions", false);
      }
    },

    promptRestartProcessModel(order, actionName) {
      var _this = this;
      if(order.get('dispatchedOrdersPackages').length) {
        this.genericAlertPopUp("order_details.restart_undispatch_warning", function() { _this.send("toggleDisplayOptions"); });
      } else {
        this.genericCustomPopUp("order_details.restart_warning", "order.restart_process", "not_now", function() { _this.set("isOrderProcessRestarted", true); _this.send("changeOrderState", order, actionName); });
      }
    },

    promptCancelOrderModel(order, actionName) {
      var _this = this;
      if(this.canCancelOrder(order)) {
        this.genericCustomPopUp("order_details.cancel_warning", "order.cancel_order", "not_now", function() { _this.send("changeOrderState", order, actionName); });
      } else {
        this.genericAlertPopUp("order_details.cancel_order_alert", function() {});
      }
    },

    promptCloseOrderModel(order, actionName) {
      var _this = this;
      if(this.canCloseOrder(order)) {
        this.genericCustomPopUp("order_details.close_warning", "order.close_order", "not_now", function() { _this.send("changeOrderState", order, actionName); });
      } else {
        this.genericAlertPopUp("order_details.close_order_dispatch_alert", function() {});
      }
    },

    changeOrderState(order, transition) {
      var url = `/orders/${order.id}/transition`;
      var loadingView = getOwner(this).lookup('component:loading').append();
      new AjaxPromise(url, "PUT", this.get('session.authToken'), { transition: transition })
        .then(data => {
          if("transition" === "restart_process") {
            this.set("isOrderProcessRestarted", false);
          }
          this.send("toggleDisplayOptions");
          data["designation"] = data["order"];
          this.get("store").pushPayload(data);
        })
        .finally(() => {
          loadingView.destroy();
          if(transition === "close") {
            this.get("appReview").promptReviewModal(true);
          }
        });
    }
  }

});
