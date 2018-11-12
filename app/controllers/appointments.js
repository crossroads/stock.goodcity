import Ember from 'ember';
import RSVP from 'rsvp';
import _ from 'lodash';
import GoodcityController from './goodcity_controller';

export default GoodcityController.extend({
  
  // ---- Tab selection

  isPresetsTab: Ember.computed.equal('selectedTab', 'presets'),
  isSpecialTab: Ember.computed.not('isPresetsTab'),

  // ---- Data structure
 
  /* Options for the select inputs [00:00, 00:30, ... 23:30]  */
  timeSlots: Ember.computed(function () {
    let buildSlot = (hours, minutes) => {
      let time = this.formatTime(hours, minutes);
      return { name: time, id: time, time, hours, minutes };
    };
    let slots = _.range(0, 24).map(h => [0, 30].map(m => buildSlot(h, m)));
    return _.flatten(slots);
  }),

  presets: Ember.computed('appointmentSlotPresets.@each', 'timeSlots', function () {
    return this.makeSelectableList(this.get('appointmentSlotPresets'));
  }),

  specialSlots: Ember.computed('appointmentSlots.@each', 'timeSlots', function () {
    return this.makeSelectableList(this.get('appointmentSlots'));
  }),

  /* Aggregate the presets by days of the week */
  presetsByWeekDay: Ember.computed('presets.@each', function () {
    return _.range(1,8).map(day => {
      const presets = this.get('presets').filter(pre => pre.get('record.day') === day);
      return Ember.Object.create({
        idx: day,
        empty: presets.length === 0,
        items: presets,
        showOptionsMenu: false
      });
    });
  }),

  /* Aggregate the speical days slots by their dates */
  specialSlotsByDate: Ember.computed('specialSlots.@each', function () {
    let slotsByDates = [];
    this.get('specialSlots').forEach(slot => {
      const record = slot.record;
      const dateString = this.getDateStringOf(record);

      let aggregate = _.find(slotsByDates, ['dateString', dateString]);
      if (!aggregate) {
        aggregate = { 
          dateString,
          date: new Date(record.get('timestamp')),
          note: '', 
          items: [],
          showOptionsMenu: false,
          noAppointments: true
        };
        slotsByDates.push(aggregate);
      }

      aggregate.items.push(slot);
      if (record.get('quota') > 0) {
        aggregate.noAppointments = false;
      }
      else if (record.get('note')) {
        // 0 quota slots are just used as placeholders to lock down the dates.
        // We display the note but they will not be displayed as editable slots
        aggregate.note = record.get('note');
      }
    });
    return slotsByDates.map(o => Ember.Object.create(o));
  }),

  init() {
    this._super();
    this.set('selectedTab', 'presets');
    this.set('appointmentSlotPresets', []);
    this.set('appointmentSlots', []);
    this.set('dateCreationPopupVisible', false);
    this.set('selectedDate', null);
    this.set('incompleteForm', false);
    this.set('dateDescription', '');
    this.loadData();
  },

  // ---- Helpers

  /* Pairs composed of a record and it's select-able timeslot */
  makeSelectableList(models) {
    return models.map(r => {
      return Ember.Object.create({
          record: r,
          timeslot: this.getTimeSlotOf(r)
      });
    });
  },

  formatTime(hour, minute) {
    return moment().set({ hour, minute }).format('HH:mm');
  },

  getTimeStringOf(record) {
    const isPreset = record.get('constructor.modelName') === 'appointment-slot-preset';
    if (isPreset) {
      return this.formatTime(record.get('hours'), record.get('minutes')); // Preset
    }
    return moment.utc(record.get('timestamp')).local().format('HH:mm'); // Special day
  },

  getDateStringOf(slot) {
    return moment.utc(slot.get('timestamp')).local().format('dddd Do MMM YYYY');
  },

  getTimeSlotOf(record) {
    const time = this.getTimeStringOf(record);
    return this.get('timeSlots').find(ts => ts.time === time);
  },

  getOpenPresetTimeslot(dayNumber) {
    return this.get('timeSlots').find(ts => {
      return !this.get('appointmentSlotPresets').find(record => record.get('day') === dayNumber &&
        record.get('hours') === ts.hours &&
        record.get('minutes') === ts.minutes
      );
    });
  },

  getOpenDateTimeslot(date) {
    return this.get('timeSlots').find(ts => {
      return !this.get('appointmentSlots').find(record => {
        let recordDate = new Date(record.get('timestamp'));
        return (this.sameDay(date, recordDate) && record.get('quota') > 0 && this.getTimeStringOf(record) === ts.time);
      });
    });
  },

  sameDay(d1, d2) {
    return d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();
  },

  // ---- Controller implementation

  loadData() {
    this.showLoadingSpinner();
    RSVP.all([
      this.store.findAll('appointment_slot_preset'),
      this.store.findAll('appointment_slot')
    ])
    .then(([appointmentSlotPresets, appointmentSlots]) => {
      this.set('appointmentSlotPresets', appointmentSlotPresets);
      this.set('appointmentSlots', appointmentSlots);
    })
    .catch(() => this.showError("Failed to load appointments", () => history.back()))
    .finally(() => this.hideLoadingSpinner());
  },

  actions: {

    back() {
      this.back();
    },

    showSpecial() {
      this.set('selectedTab', 'special');
    },

    showDefault() {
      this.set('selectedTab', 'presets');
    },

    toggleOptionsMenu(obj) {
      obj.set('showOptionsMenu', !obj.get('showOptionsMenu'));
    },

    showDateCreationPopup() {
      this.set('dateCreationPopupVisible', true);
    },

    cancelDateCreation() {
      this.set('selectedDate', null);
      this.set('dateCreationPopupVisible', false);
      this.set('incompleteForm', false);
      this.set('dateDescription', '');
    },

    createNewSpecialDate() {
      if (!this.get('dateDescription') || !this.get('selectedDate')) {
        this.set('incompleteForm', true);
        return false;
      }

      const note = this.get('dateDescription');
      const timestamp = this.get('selectedDate');
      const clear = this.send.bind(this, 'cancelDateCreation');
      const dateExists = this.get('appointmentSlots').find(sl => this.sameDay(sl.get('timestamp'), timestamp));

      if (dateExists) {
        this.showError("Selected date is already scheduled", clear);
        return;
      }
      this.createRecord('appointment_slot', { timestamp, note, quota: 0 }).finally(clear);
    },

    newSpecialSlot(date, quota = 1, note = '') {
      const { hours, minutes } = this.getOpenDateTimeslot(date);
      const timestamp = moment.utc(date)
        .local()
        .set('hours', hours)
        .set('minutes', minutes)
        .toDate();
      this.createRecord('appointment_slot', { quota, note, timestamp });
    },

    newPreset(day, quota = 1) {
      const { hours, minutes } = this.getOpenPresetTimeslot(day);
      this.createRecord('appointment_slot_preset', { quota, hours, minutes, day });
    },

    increaseQuotaOf(record) {
      return this.updateRecord(record, { quota: record.get('quota') + 1 });
    },

    decreaseQuotaOf(record) {
      let quota = record.get('quota');
      if (quota > 1) {
        return this.updateRecord(record, { quota: quota - 1 });
      }
    },

    updateSlotTime(slot, day, newTimeSlot) {
      const record = slot.get('record');
      const currentTime = new Date(record.get('timestamp'));
      const updatedTime = new Date(record.get('timestamp'));
      updatedTime.setHours(newTimeSlot.hours);
      updatedTime.setMinutes(newTimeSlot.minutes);
      if (currentTime !== updatedTime) { 
        // Has been modified
        const resetInput = () => slot.set('timeslot', this.getTimeSlotOf(record));
        const timeString = newTimeSlot.time;
        const timeslotAlreadyInUse = !!day.items.find(it => this.getTimeStringOf(it.get('record')) === timeString);
        if (timeslotAlreadyInUse) {
          return this.showError("An appointment slot already exists for this time", resetInput);
        }
        this.updateRecord(record, { timestamp: updatedTime }, { onFailure : resetInput });
      }
    },

    updatePresetTime(item, day, { time, hours, minutes }) {
      const record = item.get('record');
      if (record.get('hours') !== hours || record.get('minutes') !== minutes) { 
        // Has been modified
        const resetInput = () => item.set('timeslot', this.getTimeSlotOf(record));
        const timeslotAlreadyInUse = !!day.items.find(it => this.getTimeStringOf(it.get('record')) === time);
        if (timeslotAlreadyInUse) {
          return this.showError("An appointment slot preset already exists for this time", resetInput);
        }
        this.updateRecord(record, { hours, minutes }, { onFailure : resetInput });
      }
    },

    deleteRecord(record) {
      this.deleteRecords([ record ]);
    },

    deleteAllItems(items) {
      this.deleteRecords(items.map(it => it.record));
    }
  }
});
