import EmberObject from "@ember/object";
import Cache from "./cache";
import _ from "lodash";

export default {
  /* Options for the select inputs [00:00, 00:30, ... 23:30]  */
  timeslots: Cache.once(function() {
    let make = (hours, minutes) => {
      let time = this.formatTime(hours, minutes);
      return { name: time, id: time, time, hours, minutes };
    };
    let slots = _.range(0, 24).map(h => [make(h, 0), make(h, 30)]);
    return _.flatten(slots);
  }),

  /* Pairs composed of a record and it's select-able timeslot */
  makeSelectableList(models) {
    return models.map(r => {
      return EmberObject.create({
        record: r,
        timeslot: this.getTimeSlotOf(r)
      });
    });
  },

  formatTime(hour, minute) {
    return moment()
      .set({ hour, minute })
      .format("HH:mm");
  },

  getTimeStringOf(record) {
    const modelName = record.get("constructor.modelName");
    const isPreset = modelName === "appointment-slot-preset";
    if (isPreset) {
      return this.formatTime(record.get("hours"), record.get("minutes")); // Preset
    }
    return moment
      .utc(record.get("timestamp"))
      .local()
      .format("HH:mm"); // Special day
  },

  getDateStringOfSlot(slot) {
    return moment
      .utc(slot.get("timestamp"))
      .local()
      .format("dddd Do MMM YYYY");
  },

  getTimeSlotOf(record) {
    const time = this.getTimeStringOf(record);
    return this.timeslots().find(ts => ts.time === time);
  },

  sameDay(d1, d2) {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  }
};
