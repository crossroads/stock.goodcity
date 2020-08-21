import Ember from "ember";
import _ from "lodash";
import config from "stock/config/environment";
import apptUtils from "../utils/appointments";
import GoodcityController from "./goodcity_controller";

export default GoodcityController.extend({
  // ---- Tab selection

  isPresetsTab: Ember.computed.equal("selectedTab", "presets"),
  isSpecialTab: Ember.computed.not("isPresetsTab"),
  hkTimeZone: config.APP.HK_TIME_ZONE,

  // ---- Data structure

  timeSlots: Ember.computed(function() {
    return apptUtils.timeslots();
  }),

  presets: Ember.computed(
    "model.appointmentSlotPresets.@each.{day,hours,minutes,quota}",
    function() {
      return apptUtils.makeSelectableList(
        this.get("model.appointmentSlotPresets")
      );
    }
  ),

  specialSlots: Ember.computed(
    "model.appointmentSlots.@each.{quota,note,timestamp}",
    function() {
      return apptUtils.makeSelectableList(this.get("model.appointmentSlots"));
    }
  ),

  /* Aggregate the presets by days of the week */
  presetsByWeekDay: Ember.computed(
    "presets.@each.{record,timeslot}",
    function() {
      return _.range(1, 8).map(day => {
        const presets = this.get("presets").filter(
          pre => pre.get("record.day") === day
        );
        return Ember.Object.create({
          idx: day,
          empty: presets.length === 0,
          items: presets,
          showOptionsMenu: false
        });
      });
    }
  ),

  /* Aggregate the speical days slots by their dates */
  specialSlotsByDate: Ember.computed(
    "specialSlots.@each.{record,timeslot}",
    function() {
      let slotsByDates = [];
      this.get("specialSlots").forEach(slot => {
        const record = slot.record;
        const dateString = apptUtils.getDateStringOfSlot(record);

        let aggregate = _.find(slotsByDates, ["dateString", dateString]);
        if (!aggregate) {
          aggregate = {
            dateString,
            date: new Date(record.get("timestamp")),
            note: "",
            items: [],
            showOptionsMenu: false,
            noAppointments: true
          };
          slotsByDates.push(aggregate);
        }

        aggregate.items.push(slot);
        if (record.get("quota") > 0) {
          aggregate.noAppointments = false;
        } else if (record.get("note")) {
          // 0 quota slots are just used as placeholders to lock down the dates.
          // We display the note but they will not be displayed as editable slots
          aggregate.note = record.get("note");
        }
      });
      return slotsByDates.map(o => Ember.Object.create(o));
    }
  ),

  init() {
    this._super();
    this.set("selectedTab", "presets");
    this.set("dateCreationPopupVisible", false);
    this.set("selectedDate", null);
    this.set("incompleteForm", false);
    this.set("dateDescription", "");
  },

  // ---- Helpers

  getOpenPresetTimeslot(dayNumber) {
    return apptUtils.timeslots().find(ts => {
      return !this.get("model.appointmentSlotPresets").find(
        record =>
          record.get("day") === dayNumber &&
          record.get("hours") === ts.hours &&
          record.get("minutes") === ts.minutes
      );
    });
  },

  getOpenDateTimeslot(date) {
    return apptUtils.timeslots().find(ts => {
      return !this.get("model.appointmentSlots").find(record => {
        let recordDate = new Date(record.get("timestamp"));
        return (
          apptUtils.sameDay(date, recordDate) &&
          record.get("quota") > 0 &&
          apptUtils.getTimeStringOf(record) === ts.time
        );
      });
    });
  },

  // ---- Controller implementation

  actions: {
    back() {
      this.back();
    },

    showSpecial() {
      this.set("selectedTab", "special");
      _.map(this.get("specialSlotsByDate"), days => {
        if (days.get("showOptionsMenu")) {
          days.set("showOptionsMenu", !days.get("showOptionsMenu"));
        }
      });
    },

    showDefault() {
      this.set("selectedTab", "presets");
      _.map(this.get("presetsByWeekDay"), days => {
        if (days.get("showOptionsMenu")) {
          days.set("showOptionsMenu", !days.get("showOptionsMenu"));
        }
      });
    },

    toggleOptionsMenu(obj) {
      obj.set("showOptionsMenu", !obj.get("showOptionsMenu"));
    },

    showDateCreationPopup() {
      this.set("dateCreationPopupVisible", true);
    },

    cancelDateCreation() {
      this.set("selectedDate", null);
      this.set("dateCreationPopupVisible", false);
      this.set("incompleteForm", false);
      this.set("dateDescription", "");
    },

    createNewSpecialDate() {
      if (!this.get("dateDescription") || !this.get("selectedDate")) {
        this.set("incompleteForm", true);
        return false;
      }

      const note = this.get("dateDescription");
      const timestamp = this.get("selectedDate");
      const zone_timestamp = moment
        .tz(timestamp.toDateString(), this.get("hkTimeZone"))
        .toDate();
      const clear = this.send.bind(this, "cancelDateCreation");
      const dateExists = this.get("model.appointmentSlots").find(sl =>
        apptUtils.sameDay(sl.get("timestamp"), timestamp)
      );

      if (dateExists) {
        this.showError("Selected date is already scheduled", clear);
        return;
      }
      this.createRecord("appointment_slot", {
        timestamp: zone_timestamp,
        note,
        quota: 0
      }).finally(clear);
    },

    newSpecialSlot(date, quota = 1, note = "") {
      const { hours, minutes } = this.getOpenDateTimeslot(date);
      const timestamp = moment
        .utc(date)
        .local()
        .set("hours", hours)
        .set("minutes", minutes)
        .toDate();
      this.createRecord("appointment_slot", { quota, note, timestamp });
    },

    newPreset(day, quota = 1) {
      const { hours, minutes } = this.getOpenPresetTimeslot(day);
      this.createRecord("appointment_slot_preset", {
        quota,
        hours,
        minutes,
        day
      });
    },

    increaseQuotaOf(record) {
      return this.updateRecord(record, { quota: record.get("quota") + 1 });
    },

    decreaseQuotaOf(record) {
      let quota = record.get("quota");
      if (quota > 1) {
        return this.updateRecord(record, { quota: quota - 1 });
      }
    },

    updateSlotTime(slot, day, newTimeSlot) {
      const record = slot.get("record");
      const currentTime = new Date(record.get("timestamp"));
      const updatedTime = new Date(record.get("timestamp"));

      updatedTime.setHours(newTimeSlot.hours);
      updatedTime.setMinutes(newTimeSlot.minutes);
      if (currentTime !== updatedTime) {
        // Has been modified
        const resetInput = () =>
          slot.set("timeslot", apptUtils.getTimeSlotOf(record));
        const timeString = newTimeSlot.time;
        const timeslotAlreadyInUse = !!day.items.find(
          it => apptUtils.getTimeStringOf(it.get("record")) === timeString
        );
        if (timeslotAlreadyInUse) {
          return this.showError(
            "An appointment slot already exists for this time",
            resetInput
          );
        }
        this.updateRecord(
          record,
          { timestamp: updatedTime },
          { onFailure: resetInput }
        );
      }
    },

    updatePresetTime(item, day, { time, hours, minutes }) {
      const record = item.get("record");
      if (record.get("hours") !== hours || record.get("minutes") !== minutes) {
        // Has been modified
        const resetInput = () =>
          item.set("timeslot", apptUtils.getTimeSlotOf(record));
        const timeslotAlreadyInUse = !!day.items.find(
          it => apptUtils.getTimeStringOf(it.get("record")) === time
        );
        if (timeslotAlreadyInUse) {
          return this.showError(
            "An appointment slot preset already exists for this time",
            resetInput
          );
        }
        this.updateRecord(
          record,
          { hours, minutes },
          { onFailure: resetInput }
        );
      }
    },

    deleteRecord(record) {
      this.deleteRecords([record]);
    },

    deleteAllItems(items) {
      this.deleteRecords(items.map(it => it.record));
    }
  }
});
