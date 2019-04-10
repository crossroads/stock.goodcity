import Ember from "ember";
import AuthorizeRoute from "./authorize";

export default AuthorizeRoute.extend({
  templateName: "settings/appointments/manage_quotas",

  model() {
    return Ember.RSVP.hash({
      appointmentSlotPresets: this.store.findAll("appointment_slot_preset"),
      appointmentSlots: this.store.findAll("appointment_slot")
    });
  }
});
