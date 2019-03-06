import Ember from "ember";
import Model from "ember-data/model";
import attr from "ember-data/attr";

export default Model.extend({
  i18n: Ember.inject.service(),
  nameEn: attr("string"),
  nameZh: attr("string"),
  identifier: attr("string"),

  isAppointment: Ember.computed("identifier", function() {
    const name = this.get('identifier') && this.get('identifier').toLowerCase();
    return name === "appointment";
  }),

  isOnlineOrder: Ember.computed.not('isAppointment'),

  displayName: Ember.computed('isAppointment', function () {
    return this.get('i18n').t(`order_transports.${this.get('isAppointment') ? 'appointment' : 'online_order' }`);
  })
});
