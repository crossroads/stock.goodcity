import Ember from 'ember';
import AuthorizeRoute from './../authorize';
import AjaxPromise from 'stock/utils/ajax-promise';

export default AuthorizeRoute.extend({
  model(params) {
    var orderId = params.order_id;
    let orderTransport = this.store.peekAll("orderTransport");

    return Ember.RSVP.hash({
      availableDatesAndtime: new AjaxPromise("/appointment_slots/calendar", "GET", this.get('session.authToken'), {to: moment().add(120, 'days').format('YYYY-MM-DD')}),
      order: this.store.peekRecord('designation', orderId) || this.store.findRecord('designation', orderId),
      orderTransport: orderTransport && orderTransport.filterBy("order.id", orderId).get("firstObject")
    });
  },

  setUpFormData(model, controller) {
    var selectedId = "self";
    var selectedTime = "11:00am";
    let selectedDate = null;
    let selectedSlot = null;
    let orderTransport = model.orderTransport;
    let availableDatesAndTime = model.availableDatesAndtime;
    let slots = null;
    controller.set('isEditing', false);
    if (orderTransport){
      selectedId = orderTransport.get('transportType');
      selectedTime = orderTransport.get('timeslot');
      selectedDate = orderTransport.get("scheduledAt");
      if(selectedDate) {
        slots = availableDatesAndTime.appointment_calendar_dates.filter( date => date.date === moment(selectedDate).format('YYYY-MM-DD'))[0].slots;
        selectedSlot = slots.filter(slot => slot.timestamp.indexOf(orderTransport.get("timeslot")) >= 0)[0];
      }
      controller.set('isEditing', true);
    }
    controller.set('selectedId', selectedId);
    controller.set('selectedTimeId', selectedTime);
    controller.set('available_dates', availableDatesAndTime);
    controller.set('selectedDate', selectedDate);
    if(selectedSlot) {
      controller.set("selectedTimeId", selectedSlot.timestamp);
    }
  },

  setupController(controller, model) {
    this._super(...arguments);
    this.setUpFormData(model, controller);
  },

  deactivate(){
    this.controllerFor('application').set('showSidebar', true);
  }
});
