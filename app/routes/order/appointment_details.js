import Ember from 'ember'; // jshint ignore:line
import AjaxPromise from 'stock/utils/ajax-promise'; // jshint ignore:line
import orderUserOrganisation from './order_user_organisation';

export default orderUserOrganisation.extend({
  /* jshint ignore:start */
  async model() {
    let orderTransport = this.store.peekAll("orderTransport");
    let orderUserOrganisation = await this._super(...arguments);
    let orderId = orderUserOrganisation.order.id;

    return Ember.RSVP.hash({
      orderUserOrganisation,
      availableDatesAndtime: new AjaxPromise("/appointment_slots/calendar", "GET", this.get('session.authToken'), {to: moment().add(120, 'days').format('YYYY-MM-DD')}),
      orderTransport: orderTransport && orderTransport.filterBy("orderId", orderId).get("firstObject")
    });
  },
  /* jshint ignore:end */

  setUpFormData(model, controller) {
    var selectedId = "self";
    var selectedTime = "11:00am";
    let selectedDate = null;
    let selectedSlot = null;
    let orderTransport = model.orderTransport;
    let availableDatesAndTime = model.availableDatesAndtime;
    let slots = null;
    if (orderTransport){
      selectedId = orderTransport.get('transportType');
      selectedTime = orderTransport.get('timeslot');
      selectedDate = moment.tz(orderTransport.get("scheduledAt"), 'Asia/Hong_Kong');
      if(selectedDate) {
        slots = availableDatesAndTime.appointment_calendar_dates.filter( date => date.date === selectedDate.format('YYYY-MM-DD'))[0].slots;
        selectedSlot = slots.filter(slot => slot.timestamp.indexOf(orderTransport.get("timeslot")) >= 0)[0];
      }
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
