import { alias, equal } from "@ember/object/computed";
import { computed } from "@ember/object";
import { inject as service } from "@ember/service";
import Model from "ember-data/model";
import attr from "ember-data/attr";
import { belongsTo, hasMany } from "ember-data/relationships";

export default Model.extend({
  i18n: service(),
  utilityMethods: service(),

  status: attr("string"),
  state: attr("string"),
  createdAt: attr("date"),
  recentlyUsedAt: attr("date"),
  submittedAt: attr("date"),
  submittedById: attr("number"),
  createdById: attr("number"),
  processedAt: attr("date"),
  processedById: attr("number"),
  cancelledAt: attr("date"),
  cancelledById: attr("number"),
  processCompletedAt: attr("date"),
  processCompletedById: attr("number"),
  closedAt: attr("date"),
  closedById: attr("number"),
  dispatchStartedAt: attr("date"),
  dispatchStartedBy: attr("number"),
  code: attr("string"),
  activity: attr("string"),
  description: attr("string"),
  detailType: attr("string"),
  detailId: attr("number"),
  purposeDescription: attr("string"),
  gcOrganisationId: attr("number"),
  beneficiaryId: attr("number"),
  staffNote: attr("string"),

  beneficiary: belongsTo("beneficiary", { async: false }),
  stockitContact: belongsTo("stockit_contact", { async: false }),
  organisation: belongsTo("organisation", { async: false }),
  gcOrganisation: belongsTo("gcOrganisation", { async: true }),
  localOrder: belongsTo("local_order", { async: false }),
  items: hasMany("item", { async: true }),
  goodcityRequests: hasMany("goodcity_request", { async: false }),
  ordersPackages: hasMany("ordersPackages", { async: false }),
  messages: hasMany("message", { async: true }),
  orderTransport: belongsTo("orderTransport", { async: false }),
  ordersPurposes: hasMany("ordersPurpose", { async: false }),
  submittedBy: belongsTo("user", { async: false }),
  bookingType: belongsTo("booking_type", { async: false }),
  bookingTypeId: attr("number"),
  createdBy: belongsTo("user", { async: true }),
  peopleHelped: attr("number"),
  districtId: attr("number"),
  district: belongsTo("district", { async: false }),
  ordersProcessChecklists: hasMany("ordersProcessChecklists", { async: false }),
  ordersProcessChecklistIds: attr(),

  clientIdType: computed("beneficiary", "beneficiary.identityType", function() {
    return this.get("beneficiary.identityType.name");
  }),

  clientIdNumber: alias("beneficiary.identityNumber"),
  clientName: alias("beneficiary.fullName"),
  clientPhone: alias("beneficiary.phoneNumber"),

  isEditAllowed: computed("state", function() {
    return !(this.get("isCancelled") || this.get("isClosed"));
  }),

  isLocalOrder: computed("detailType", function() {
    return (
      ["LocalOrder", "StockitLocalOrder"].indexOf(this.get("detailType")) > -1
    );
  }),

  isGoodCityOrder: equal("detailType", "GoodCity"),

  isAppointment: computed("bookingType", function() {
    const bookingType = this.get("bookingType");
    return bookingType && bookingType.get("isAppointment");
  }),

  isOnlineOrder: computed("bookingType", function() {
    const bookingType = this.get("bookingType");
    return bookingType && bookingType.get("isOnlineOrder");
  }),

  isDraft: equal("state", "draft"),
  isSubmitted: equal("state", "submitted"),
  isAwaitingDispatch: equal("state", "awaiting_dispatch"),
  isDispatching: equal("state", "dispatching"),
  isClosed: equal("state", "closed"),
  isProcessing: equal("state", "processing"),
  isCancelled: equal("state", "cancelled"),

  dispatchedItems: computed("items.@each.sentOn", function() {
    return this.get("items").rejectBy("sentOn", null);
  }),

  capitalizedState: computed("state", function() {
    return this.get("state").capitalize();
  }),

  purposeName: computed("ordersPurposes.[]", function() {
    return this.get("ordersPurposes.firstObject.purpose.description");
  }),

  purposeId: computed("ordersPurposes.[]", function() {
    return this.get("ordersPurposes.firstObject.purpose.nameEn");
  }),

  stateIcon: computed("state", function() {
    const state = this.get("state");
    switch (state) {
      case "awaiting_dispatch":
      case "scheduled":
        return "clock";
      case "processing":
        return "list";
      case "submitted":
        return "envelope";
      case "dispatching":
        return "paper-plane";
      case "cancelled":
        return "thumbs-down";
      case "closed":
        return "lock";
      default:
        return "";
    }
  }),

  appointmentTransportLabel: computed(
    "orderTransport.transportType",
    function() {
      let i18n = this.get("i18n");
      return this.get("orderTransport.transportType") === "self"
        ? i18n.t("order.appointment.self_vehicle")
        : i18n.t("order.appointment.hire_vehicle");
    }
  ),

  stateText: computed("orderTransport", function() {
    if (this.get("isAppointment")) {
      return "appointment";
    } else if (this.get("isOnlineOrder")) {
      return "online_order";
    }
  }),

  appointmentTime: computed(
    "orderTransport.scheduledAt",
    "orderTransport.timeslot",
    function() {
      let orderTransport = this.get("orderTransport");
      if (orderTransport) {
        return `${moment(orderTransport.get("scheduledAt")).format(
          "dddd MMMM Do"
        )}, ${orderTransport.get("timeslot")}`;
      } else {
        return "";
      }
    }
  ),

  transportIcon: computed("isAppointment", "isOnlineOrder", function() {
    if (this.get("isAppointment")) {
      return "warehouse";
    } else if (this.get("isOnlineOrder")) {
      return "desktop";
    } else {
      return "question";
    }
  }),

  transportLabel: computed("stateText", "orderTransport", function() {
    const key = this.get("stateText") || "unknown_transport";
    return this.get("i18n").t(`order_transports.${key}`);
  }),

  transportKey: computed("orderTransport.transportType", function() {
    const transportType = this.get("orderTransport.transportType");
    switch (transportType) {
      case "ggv":
        return "gogovan_transport";
      case "self":
        return "collection_transport";
      default:
        return "unknown_transport";
    }
  }),

  ordersPackagesCount: computed(
    "ordersPackages.[]",
    "ordersPackages.@each.quantity",
    "ordersPackages.@each.state",
    function() {
      return this.get("ordersPackages").filterBy("quantity").length;
    }
  ),

  allDispatchedOrdersPackages: computed(
    "ordersPackages.@each.state",
    "ordersPackages.@each.quantity",
    function() {
      var ordersPackages = this.get("quantityOrdersPackages");
      return (
        this.get("utilityMethods").arrayExists(ordersPackages) &&
        ordersPackages.filterBy("isDispatched", false).length === 0
      );
    }
  ),

  allDesignatedOrdersPackages: computed(
    "ordersPackages.@each.state",
    "ordersPackages.@each.quantity",
    function() {
      var ordersPackages = this.get("quantityOrdersPackages");
      return (
        this.get("utilityMethods").arrayExists(ordersPackages) &&
        ordersPackages.filterBy("isDispatched", true).length === 0
      );
    }
  ),

  quantityOrdersPackages: computed(
    "ordersPackages.@each.state",
    "ordersPackages.@each.quantity",
    function() {
      return this.get("ordersPackages").filterBy("quantity");
    }
  ),

  allItemsDispatched: computed("items.@each.isDispatched", function() {
    var items = this.get("items");
    return (
      items.get("length") > 0 &&
      items.filterBy("isDispatched", false).length === 0
    );
  }),

  designatedOrdersPackages: computed("ordersPackages.@each.state", function() {
    return this.get("ordersPackages").filterBy("state", "designated");
  }),

  dispatchedOrdersPackages: computed("ordersPackages.@each.state", function() {
    return this.get("ordersPackages").filterBy("state", "dispatched");
  }),

  cancelledOrdersPackages: computed("ordersPackages.@each.state", function() {
    return this.get("ordersPackages").filterBy("state", "cancelled");
  }),

  designatedItems: computed("items.@each.sentOn", function() {
    return this.get("items").filterBy("sentOn", null);
  }),

  isInactive: computed("status", function() {
    return ["Sent", "Cancelled", "Closed"].indexOf(this.get("status")) >= 0;
  }),

  // unread order messages
  unreadMessagesCount: computed("messages.@each.state", function() {
    return this.get("messages").filterBy("state", "unread").length;
  }),

  hasUnreadMessages: computed("unreadMessagesCount", function() {
    return this.get("unreadMessagesCount") > 0;
  })
});
