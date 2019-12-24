import Ember from "ember";
import config from "../../config/environment";
import AjaxPromise from "stock/utils/ajax-promise";
import GoodcityController from "../goodcity_controller";
import _ from "lodash";
const { getOwner } = Ember;

export default GoodcityController.extend({
  backLinkPath: "",
  displayAllItems: false,
  isMobileApp: config.cordova.enabled,
  order: Ember.computed.alias("model"),
  hasUnreadMessages: Ember.computed("order", function() {
    return this.get("order.hasUnreadMessages");
  }),

  unreadMessagesCount: Ember.computed("order", function() {
    return this.get("order.unreadMessagesCount");
  }),

  itemIdforHistoryRoute: null,
  organisationIdforHistoryRoute: null,
  store: Ember.inject.service(),
  messageBox: Ember.inject.service(),
  intl: Ember.inject.service(),
  placeHolderDate: null,
  appReview: Ember.inject.service(),
  isOrderProcessRestarted: false,
  isActiveGoods: false,
  isActiveSummary: false,
  scheduleChangePopupVisible: false,
  filterService: Ember.inject.service(),
  processingChecklist: Ember.inject.service(),

  scheduleTimeSlots: Ember.computed(function() {
    let buildSlot = (hours, minutes) => {
      const key = this.formatTimeSlot(hours, minutes);
      return { name: key, id: key, hours, minutes };
    };
    let slots = _.range(0, 23).map(h => [0, 30].map(m => buildSlot(h, m)));
    return _.flatten(slots);
  }),

  displayOrderOptions: Ember.computed({
    get: function() {
      return false;
    },
    set: function(key, value) {
      return value;
    }
  }),

  ordersPackagesLengthMoreThenThree: Ember.observer(
    "model.ordersPackages",
    function() {
      var ordersPackages = this.get("model.ordersPackages");
      ordersPackages.canonicalState.forEach(record => {
        if (record && record._data.state === "cancelled") {
          ordersPackages.canonicalState.removeObject(record);
        }
      });
      return ordersPackages.canonicalState.length >= 3
        ? this.set("displayAllItems", false)
        : this.set("displayAllItems", true);
    }
  ),

  itemsList: Ember.computed(
    "model.items",
    "displayAllItems",
    "model.ordersPackages",
    "model.ordersPackages.@each.quantity",
    "model.ordersPackages.@each.state",
    function() {
      var ordersPackages = this.get("model.ordersPackages")
        .rejectBy("state", "requested")
        .rejectBy("state", "cancelled")
        .rejectBy("state", null);
      return this.get("displayAllItems")
        ? ordersPackages
        : ordersPackages.slice(0, 3);
    }
  ),

  canceledItemsList: Ember.computed(
    "model.items",
    "displayAllItems",
    "model.ordersPackages",
    "model.ordersPackages.@each.quantity",
    "model.ordersPackages.@each.state",
    function() {
      var ordersPackages = this.get("model.ordersPackages")
        .filterBy("state", "cancelled")
        .rejectBy("state", null);
      return this.get("displayAllItems")
        ? ordersPackages
        : ordersPackages.slice(0, 3);
    }
  ),

  ordersPkgLength: Ember.computed(
    "model.items",
    "displayAllItems",
    "model.ordersPackages",
    "model.ordersPackages.@each.quantity",
    "model.ordersPackages.@each.state",
    function() {
      return this.get("model.ordersPackages")
        .rejectBy("state", "requested")
        .rejectBy("state", null).length;
    }
  ),

  formatTimeSlot(hours, minutes) {
    return moment()
      .set("hour", hours)
      .set("minute", minutes)
      .format("hh:mmA");
  },

  genericCustomPopUp(message, button1text, button2text, btn1Callback) {
    var _this = this;
    _this.get("messageBox").custom(
      _this.get("intl").t(message),
      _this.get("intl").t(button1text),
      () => {
        btn1Callback();
      },
      _this.get("intl").t(button2text),
      () => {
        this.send("toggleDisplayOptions");
      }
    );
  },

  genericAlertPopUp(message, btn1Callback = _.noop) {
    var _this = this;
    this.get("messageBox").alert(_this.get("intl").t(message), () => {
      btn1Callback();
    });
  },

  //Should only be able to close if at least 1 item is dispatched and 0 is designated
  canCloseOrder(order) {
    let ordersPackages = order.get("ordersPackages");
    return (
      ordersPackages.filterBy("state", "dispatched").length > 0 &&
      !ordersPackages.filterBy("state", "designated").length
    );
  },

  //Should only be able to cancel if 0 items are dispatched
  canCancelOrder(order) {
    return !order.get("ordersPackages").filterBy("state", "dispatched").length;
  },

  actions: {
    openSchedulePopup() {
      const scheduledAt = this.get("model.orderTransport.scheduledAt");
      try {
        const d = new Date(scheduledAt);
        const timeString = this.formatTimeSlot(d.getHours(), d.getMinutes());
        const currentTimeSlot = _.find(this.get("scheduleTimeSlots"), [
          "id",
          timeString
        ]);
        this.set(
          "selectedTimeslot",
          currentTimeSlot || this.get("scheduleTimeSlots")[0]
        );
        this.set("selectedScheduleDate", d);
        this.set("placeHolderDate", moment(d).format("ddd MMM do"));
      } catch (e) {
        this.set("selectedTimeslot", this.get("scheduleTimeSlots")[0]);
        this.set("selectedScheduleDate", null);
      }
      this.set("scheduleChangePopupVisible", true);
    },

    closeSchedulePopup() {
      this.set("scheduleChangePopupVisible", false);
    },

    saveNewSchedule() {
      let ts = this.get("selectedTimeslot");
      let date = this.get("selectedScheduleDate");
      if (!date || !ts) {
        return this.showError("Please select a valid date and timeslot");
      }

      date.setHours(ts.hours);
      date.setMinutes(ts.minutes);
      this.updateRecord(this.get("model.orderTransport"), {
        timeslot: ts.id,
        scheduledAt: date
      });
    },

    selectTimeslot(ts) {
      this.set("selectedTimeslot", ts);
    },

    toggleOrderOptions() {
      this.toggleProperty("displayOrderOptions");
    },

    displayAllItems() {
      this.set("displayAllItems", true);
    },

    updateOrder(order, actionName) {
      switch (actionName) {
        case "messagePopUp":
          this.send("changeOrderState", order, "cancel");
          break;
        case "start_processing":
          this.send("changeOrderState", order, actionName);
          break;
        case "resubmit":
          this.send("promptResubmitModel", order, actionName);
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
        case "finish_processing":
          this.send("verifyChecklistAndChangeState", order, actionName);
          break;
        case "start_dispatching":
          this.send("verifyChecklistAndChangeState", order, actionName);
          break;
        default:
          this.send("changeOrderState", order, actionName);
      }
    },

    verifyChecklistAndChangeState(order, actionName) {
      if (this.get("processingChecklist").checklistCompleted(order)) {
        this.send("changeOrderState", order, actionName);
      } else {
        this.genericAlertPopUp("order_details.logistics.checklist_incomplete");
      }
    },

    dispatchLaterModel(order, actionName) {
      var _this = this;
      if (order.get("dispatchedOrdersPackages").length) {
        this.genericAlertPopUp(
          "order_details.dispatch_later_undispatch_warning",
          function() {
            _this.send("toggleDisplayOptions");
          }
        );
      } else {
        this.genericCustomPopUp(
          "order_details.dispatch_later_warning",
          "order.dispatch_later",
          "not_now",
          function() {
            _this.send("changeOrderState", order, actionName);
          }
        );
      }
    },

    promptResubmitModel(order, actionName) {
      var _this = this;
      this.genericCustomPopUp(
        "order_details.resubmit_order_warning",
        "order.resubmit",
        "not_now",
        function() {
          _this.send("changeOrderState", order, actionName);
        }
      );
    },

    promptReopenModel(order, actionName) {
      var _this = this;
      this.genericCustomPopUp(
        "order_details.reopen_warning",
        "order.reopen_order",
        "not_now",
        function() {
          _this.send("changeOrderState", order, actionName);
        }
      );
    },

    toggleDisplayOptions() {
      if (this.get("displayOrderOptions")) {
        this.set("displayOrderOptions", false);
      }
    },

    promptRestartProcessModel(order, actionName) {
      var _this = this;
      if (order.get("dispatchedOrdersPackages").length) {
        this.genericAlertPopUp(
          "order_details.restart_undispatch_warning",
          function() {
            _this.send("toggleDisplayOptions");
          }
        );
      } else {
        this.genericCustomPopUp(
          "order_details.restart_warning",
          "order.restart_process",
          "not_now",
          function() {
            _this.set("isOrderProcessRestarted", true);
            _this.send("changeOrderState", order, actionName);
          }
        );
      }
    },

    promptCancelOrderModel(order, actionName) {
      var _this = this;
      if (this.canCancelOrder(order)) {
        this.genericCustomPopUp(
          "order_details.cancel_warning",
          "order.cancel_order",
          "not_now",
          function() {
            _this.send("changeOrderState", order, actionName);
          }
        );
      } else {
        this.genericAlertPopUp(
          "order_details.cancel_order_alert",
          function() {}
        );
      }
    },

    promptCloseOrderModel(order, actionName) {
      var _this = this;
      if (this.canCloseOrder(order)) {
        this.genericCustomPopUp(
          "order_details.close_warning",
          "order.close_order",
          "not_now",
          function() {
            _this.send("changeOrderState", order, actionName);
          }
        );
      } else {
        this.genericAlertPopUp(
          "order_details.close_order_dispatch_alert",
          function() {}
        );
      }
    },

    changeOrderState(order, transition) {
      var url = `/orders/${order.id}/transition`;
      var loadingView = getOwner(this)
        .lookup("component:loading")
        .append();
      new AjaxPromise(url, "PUT", this.get("session.authToken"), {
        transition: transition
      })
        .then(data => {
          if ("transition" === "restart_process") {
            this.set("isOrderProcessRestarted", false);
          }
          this.send("toggleDisplayOptions");
          data["designation"] = data["order"];
          this.get("store").pushPayload(data);
        })
        .finally(() => {
          loadingView.destroy();
          if (transition === "close") {
            this.get("appReview").promptReviewModal(true);
          }
        });
    }
  }
});
