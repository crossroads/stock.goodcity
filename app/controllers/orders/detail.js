import Ember from "ember";
import config from "stock/config/environment";
import GoodcityController from "../goodcity_controller";
import SearchMixin from "stock/mixins/search_resource";
import _ from "lodash";
const { getOwner } = Ember;
import AsyncMixin, { ERROR_STRATEGIES } from "stock/mixins/async";

export default GoodcityController.extend(AsyncMixin, SearchMixin, {
  backLinkPath: "",
  displayAllItems: false,
  cancelReasonLength: 180,
  otherCancellationReason: "",
  isMobileApp: config.cordova.enabled,
  hkTimeZone: config.APP.HK_TIME_ZONE,
  order: Ember.computed.alias("model"),
  orderId: Ember.computed.alias("model.id"),
  showCancellationReason: false,

  hasUnreadMessages: Ember.computed("order", function() {
    return this.get("order.hasUnreadMessages");
  }),

  unreadMessagesCount: Ember.computed("order", function() {
    return this.get("order.unreadMessagesCount");
  }),

  store: Ember.inject.service(),
  messageBox: Ember.inject.service(),
  i18n: Ember.inject.service(),
  placeHolderDate: null,
  appReview: Ember.inject.service(),
  application: Ember.inject.controller(),
  isOrderProcessRestarted: false,
  scheduleChangePopupVisible: false,
  filterService: Ember.inject.service(),
  processingChecklist: Ember.inject.service(),
  orderService: Ember.inject.service(),
  currentRoute: Ember.computed.alias("application.currentPath"),

  tabName: Ember.computed("currentRoute", function() {
    return this.get("currentRoute")
      .split(".")
      .get("lastObject");
  }),

  highlightSelectedTabSummary: Ember.computed("tabName", function() {
    return (
      ["client_summary", "contact_summary"].indexOf(this.get("tabName")) >= 0
    );
  }),

  highlightSelectedTabGoods: Ember.computed("tabName", function() {
    return (
      ["active_items", "requested_items"].indexOf(this.get("tabName")) >= 0
    );
  }),

  scheduleTimeSlots: Ember.computed(function() {
    let buildSlot = (hours, minutes) => {
      const key = this.formatTimeSlot(hours, minutes);
      return {
        name: key,
        id: key,
        hours,
        minutes
      };
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

  cancelReason: Ember.computed.oneWay("model.cancelReason"),

  cancelText: Ember.computed("model.cancellationReason", function() {
    let cancelTextKey = this.get("model.cancellationReason")
      ? "update_reason"
      : "cancel_order";
    return this.get("i18n").t(`order_details.${cancelTextKey}`);
  }),

  cancellationReasons: Ember.computed(function() {
    return this.store.peekAll("cancellation_reason");
  }),

  cancellationReasonId: Ember.computed("model.cancellationReason", function() {
    return (
      this.get("model.cancellationReason.id") ||
      this.get("cancellationReasons.firstObject.id")
    );
  }),

  remainingReasonChars: Ember.computed("cancelReason", function() {
    return (
      this.get("cancelReasonLength") -
      ((this.get("cancelReason") && this.get("cancelReason").length) || 0)
    );
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

  organisationsUser: Ember.computed(
    "model.{createdBy,isGoodCityOrder}",
    "model.createdBy.organisationsUsers.@each.{status,organisationId}",
    "model.createdBy.organisationsUsers.[]",
    "model.{organisation,isGoodCityOrder}",
    function() {
      if (!this.get("model.isGoodCityOrder")) {
        return null;
      }

      const organisationsUsers = this.getWithDefault(
        "model.createdBy.organisationsUsers",
        []
      );

      return organisationsUsers.findBy(
        "organisationId",
        this.get("model.organisationId")
      );
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
      _this.get("i18n").t(message),
      _this.get("i18n").t(button1text),
      () => {
        btn1Callback();
      },
      _this.get("i18n").t(button2text),
      () => {
        this.send("toggleDisplayOptions");
      }
    );
  },

  genericAlertPopUp(message, btn1Callback = _.noop) {
    var _this = this;
    this.get("messageBox").alert(_this.get("i18n").t(message), () => {
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

  async verifyOrgApproval(cb) {
    if (
      !this.get("organisationsUser") ||
      this.get("organisationsUser.isApproved")
    ) {
      return cb();
    }

    await this.modalAlert("order.cannot_process_unless_approved");
    this.replaceRoute("orders.contact_summary", this.get("model.id"));
  },

  actions: {
    cancelOrder() {
      const reason = {
        cancellation_reason_id: this.get("cancellationReasonId"),
        cancel_reason: this.get("cancelReason")
      };
      this.runTask(
        this.get("orderService")
          .cancelOrder(this.get("order"), reason)
          .then(() => {
            this.send("toggleDisplayOptions");
            this.setProperties({
              otherCancellationReason: ""
            });
          }),
        ERROR_STRATEGIES.MODAL
      );
    },

    openSchedulePopup() {
      const scheduledAt = this.get("model.orderTransport.scheduledAt");
      try {
        const scheduledDate = moment.tz(scheduledAt, this.get("hkTimeZone"));
        const timeString = scheduledDate.format("hh:mmA");

        const currentTimeSlot = _.find(this.get("scheduleTimeSlots"), [
          "id",
          timeString
        ]);

        this.set(
          "selectedTimeslot",
          currentTimeSlot || this.get("scheduleTimeSlots")[0]
        );

        const formattedScheduledDate = moment(scheduledDate).format(
          "D MMMM, YYYY"
        );

        this.set("selectedScheduleDate", scheduledDate.format());
        this.set("scheduledAtStringPlaceholder", formattedScheduledDate);
        this.set("placeHolderDate", formattedScheduledDate);
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

      date = typeof date === "string" ? new Date(date) : date;
      let tzDate = moment.tz(date.toDateString(), this.get("hkTimeZone"));
      tzDate.set({
        hour: ts.hours,
        minute: ts.minutes
      });

      this.updateRecord(this.get("model.orderTransport"), {
        timeslot: ts.id,
        scheduledAt: tzDate
      });
    },

    selectTimeslot(ts) {
      this.set("selectedTimeslot", ts);
    },

    toggleOrderOptions() {
      this.toggleProperty("displayOrderOptions");
    },

    resetCancellationReason() {
      this.set("cancelReason", "");
      this.set(
        "order.cancellationReason",
        this.get("cancellationReasons").get("firstObject")
      );
    },

    updateOrder(order, actionName) {
      switch (actionName) {
        case "messagePopUp":
          this.send("changeOrderState", order, "cancel");
          break;
        case "start_processing":
          this.verifyOrgApproval(() => {
            this.send("changeOrderState", order, actionName);
          });
          break;
        case "resubmit":
          this.send("promptResubmitModel", order, actionName);

          //clear cancel reason from ember data.
          this.send("resetCancellationReason");
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
          this.set("showCancellationReason", true);
          break;
        case "close":
          this.send("promptCloseOrderModel", order, actionName);
          break;
        case "finish_processing":
          this.verifyOrgApproval(() => {
            this.send("verifyChecklistAndChangeState", order, actionName);
          });
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
      this.runTask(
        this.get("orderService")
          .changeOrderState(order, transition)
          .then(data => {
            if (transition === "restart_process") {
              this.set("isOrderProcessRestarted", false);
            }
            this.send("toggleDisplayOptions");
          })
          .finally(() => {
            if (transition === "close") {
              this.get("appReview").promptReviewModal(true);
            }
          })
      );
    }
  }
});
