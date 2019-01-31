import Ember from 'ember';
import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { belongsTo, hasMany } from 'ember-data/relationships';

export default Model.extend({
  i18n: Ember.inject.service(),
  utilityMethods: Ember.inject.service(),

  status:               attr('string'),
  state:                attr('string'),
  createdAt:            attr('date'),
  recentlyUsedAt:       attr('date'),
  submittedAt:          attr('date'),
  submittedById:        attr('number'),
  createdById:        attr('number'),
  processedAt:          attr('date'),
  processedById:        attr('number'),
  cancelledAt:          attr('date'),
  cancelledById:        attr('number'),
  processCompletedAt:   attr('date'),
  processCompletedById: attr('number'),
  closedAt:             attr('date'),
  closedById:           attr('number'),
  dispatchStartedAt:    attr('date'),
  dispatchStartedBy:    attr('number'),
  code:                 attr('string'),
  activity:             attr('string'),
  description:          attr('string'),
  detailType:           attr('string'),
  detailId:             attr('number'),
  purposeDescription:   attr('string'),
  gcOrganisationId:     attr('number'),

  stockitContact:     belongsTo('stockit_contact', { async: false }),
  organisation:       belongsTo('organisation', { async: false }),
  gcOrganisation:     belongsTo('gcOrganisation', { async: false }),
  localOrder:         belongsTo('local_order', { async: false }),
  items:              hasMany('item', { async: true }),
  goodcityRequests:   hasMany('goodcity_request', { async: false }),
  ordersPackages:     hasMany('ordersPackages', { async: false }),
  orderTransport:     belongsTo('orderTransport', { async: false }),
  ordersPurposes:     hasMany('ordersPurpose', { async: false }),
  submittedBy:        belongsTo('user', { async: false }),
  bookingType:        belongsTo('booking_type', { async: false }),
  createdBy:        belongsTo('user', { async: false }),
  peopleHelped: attr('number'),
  districtId:       attr('number'),

  isLocalOrder: Ember.computed('detailType', function(){
    return (this.get('detailType') === 'LocalOrder') || (this.get('detailType') === 'StockitLocalOrder');
  }),
  isGoodCityOrder: Ember.computed.equal('detailType', 'GoodCity'),

  isAppointment: Ember.computed("bookingType", function () {
    const bookingType = this.get('bookingType');
    return bookingType && bookingType.get('isAppointment');
  }),

  isOnlineOrder: Ember.computed("bookingType", function () {
    const bookingType = this.get('bookingType');
    return bookingType && bookingType.get('isOnlineOrder');
  }),

  isDraft: Ember.computed.equal("state", "draft"),
  isSubmitted: Ember.computed.equal("state", "submitted"),
  isAwaitingDispatch: Ember.computed.equal("state", "awaiting_dispatch"),
  isDispatching: Ember.computed.equal("state", "dispatching"),
  isClosed: Ember.computed.equal("state", "closed"),
  isProcessing: Ember.computed.equal("state", "processing"),
  isCancelled: Ember.computed.equal("state", "cancelled"),

  dispatchedItems: Ember.computed('items.@each.sentOn', function() {
    return this.get("items").rejectBy('sentOn', null);
  }),

  capitalizedState: Ember.computed('state', function() {
    return this.get("state").capitalize();
  }),

  purposeName: Ember.computed("ordersPurposes.[]", function() {
    return this.get("ordersPurposes.firstObject.purpose.description");
  }),

  purposeId: Ember.computed("ordersPurposes.[]", function() {
    return this.get("ordersPurposes.firstObject.purpose.nameEn");
  }),

  stateIcon: Ember.computed('state', function () {
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

  appointmentTransport: Ember.computed("orderTransport", function() {
    let i18n = this.get("i18n");
    return this.get("orderTransport.transportType") === "self" ?
      i18n.t("order.appointment.self_vehicle") : i18n.t("order.appointment.hire_vehicle");
  }),

  stateText: Ember.computed("orderTransport", function() {
    if(this.get("isAppointment")) {
      return "appointment";
    } else if(this.get("isOnlineOrder")) {
      return "online_order";
    }
  }),

  appointmentTime: Ember.computed("orderTransport", function() {
    let orderTransport = this.get("orderTransport");
    if(orderTransport) {
      return `${moment(orderTransport.get("scheduledAt")).format('dddd MMMM Do')}, ${orderTransport.get("timeslot")}`;
    } else {
      return "";
    }
  }),

  transportIcon: Ember.computed("orderTransport", function() {
    if(this.get("isAppointment")) {
      return "warehouse";
    } else if(this.get("isOnlineOrder")) {
      return "desktop";
    } else {
      return "question";
    }
  }),

  transportLabel: Ember.computed("stateText", 'orderTransport', function() {
    const key = this.get('stateText') || "unknown_transport";
    return this.get("i18n").t(`order_transports.${key}`);
  }),

  transportKey: Ember.computed("orderTransport.transportType", function() {
    const transportType = this.get('orderTransport.transportType');
    switch (transportType) {
      case "ggv":
        return "gogovan_transport";
      case "self":
        return "collection_transport";
      default:
        return "unknown_transport";
    }
   }),

  ordersPackagesCount: Ember.computed('ordersPackages.[]', 'ordersPackages.@each.quantity', 'ordersPackages.@each.state', function() {
    return this.get("ordersPackages").filterBy('quantity').length;
  }),

  allDispatchedOrdersPackages: Ember.computed('ordersPackages.@each.state', 'ordersPackages.@each.quantity', function() {
    var ordersPackages = this.get("quantityOrdersPackages");
    return this.get("utilityMethods").arrayExists(ordersPackages) && ordersPackages.filterBy('isDispatched', false).length === 0;
  }),

  allDesignatedOrdersPackages: Ember.computed('ordersPackages.@each.state', 'ordersPackages.@each.quantity', function() {
    var ordersPackages = this.get("quantityOrdersPackages");
    return this.get("utilityMethods").arrayExists(ordersPackages) && ordersPackages.filterBy('isDispatched', true).length === 0;
  }),

  quantityOrdersPackages: Ember.computed("ordersPackages.@each.state", "ordersPackages.@each.quantity", function() {
    return this.get("ordersPackages").filterBy('quantity');
  }),

  allItemsDispatched: Ember.computed('items.@each.isDispatched', function() {
    var items = this.get("items");
    return items.get('length') > 0 && items.filterBy('isDispatched', false).length === 0;
  }),

  designatedOrdersPackages: Ember.computed('ordersPackages.@each.state', function() {
    return this.get("ordersPackages").filterBy('state', "designated");
  }),

  dispatchedOrdersPackages: Ember.computed('ordersPackages.@each.state', function() {
    return this.get("ordersPackages").filterBy('state', "dispatched");
  }),

  cancelledOrdersPackages: Ember.computed('ordersPackages.@each.state', function() {
    return this.get("ordersPackages").filterBy('state', "cancelled");
  }),

  designatedItems: Ember.computed('items.@each.sentOn', function() {
    return this.get("items").filterBy('sentOn', null);
  }),

  isInactive: Ember.computed('status', function(){
    return ["Sent", "Cancelled", "Closed"].indexOf(this.get("status")) >= 0;
  })

});
