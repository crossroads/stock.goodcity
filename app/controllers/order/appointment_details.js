import $ from "jquery";
import { computed } from "@ember/object";
import { alias } from "@ember/object/computed";
import Controller from "@ember/controller";
import { getOwner } from "@ember/application";
import AjaxPromise from "stock/utils/ajax-promise";
import config from "../../config/environment";

export default Controller.extend({
  order: alias("model.orderUserOrganisation.order"),
  orderTransport: alias("model.orderTransport"),
  selectedId: null,
  selectedTimeId: null,
  selectedDate: null,
  timeSlotNotSelected: false,
  isMobileApp: config.cordova.enabled,

  timeSlots: computed("selectedDate", function() {
    var selectedDate = this.get("selectedDate");
    if (selectedDate) {
      var timeSlots = this.get(
        "available_dates"
      ).appointment_calendar_dates.filter(
        date => date.date === moment(selectedDate).format("YYYY-MM-DD")
      )[0].slots;
      return timeSlots;
    }
  }),

  orderTransportParams() {
    var orderTransportProperties = {};
    orderTransportProperties.scheduled_at = this.get("selectedTimeId");
    orderTransportProperties.timeslot = this.get("selectedTimeId").substr(
      11,
      5
    );
    orderTransportProperties.transport_type = this.get("selectedId");
    orderTransportProperties.order_id = this.get("order.id");
    return orderTransportProperties;
  },

  actions: {
    saveTransportDetails() {
      const isTimeSlotSelected = $(".time-slots input")
        .toArray()
        .filter(radioButton => radioButton.checked === true).length;
      if (isTimeSlotSelected) {
        this.set("timeSlotNotSelected", false);
      } else {
        this.set("timeSlotNotSelected", true);
        return false;
      }
      var orderTransport = this.get("orderTransport");

      var url, actionType;

      if (orderTransport) {
        url = "/order_transports/" + orderTransport.get("id");
        actionType = "PUT";
      } else {
        url = "/order_transports";
        actionType = "POST";
      }

      this.send("saveOrUpdateOrderTransport", url, actionType);
    },

    saveOrUpdateOrderTransport(url, actionType) {
      var loadingView = getOwner(this)
        .lookup("component:loading")
        .append();

      new AjaxPromise(url, actionType, this.get("session.authToken"), {
        order_transport: this.orderTransportParams()
      }).then(data => {
        this.get("store").pushPayload(data);
        loadingView.destroy();
        this.transitionToRoute("order.confirm_booking", this.get("order.id"));
      });
    }
  }
});
