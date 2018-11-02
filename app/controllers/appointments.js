import Ember from 'ember';
import RSVP from 'rsvp';
import _ from 'lodash';

export default Ember.Controller.extend({

  // ---- Services
  messageBox: Ember.inject.service(),
  
  // ---- Tab selection

  isPresetsTab: Ember.computed.equal('selectedTab', 'presets'),
  isSpecialTab: Ember.computed.not('isPresetsTab'),

  // ---- Data structure

  /* Options for the select inputs [00:00, 00:30, ... 23:30] */
  timeSlots: Ember.computed(function () {
    let buildSlot = (h, m) => {
      let time = this.formatTime(h, m);
      return Ember.Object.create({ name: time, id: time, time, hours: h, minutes: m });
    };
    let slots = _.range(0, 24).map(h => [0, 30].map(m => buildSlot(h, m)));
    return _.flatten(slots);
  }),

  presets: Ember.computed('appointmentSlotPresets.@each', 'timeSlots', function () {
    return this.makeSelectableList(this.get('appointmentSlotPresets'));
  }),

  /* Aggregate the presets by days */
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

  specialSlots: Ember.computed('appointmentSlots.@each', 'timeSlots', function () {
    return this.makeSelectableList(this.get('appointmentSlots'));
  }),

  specialSlotsByDate: Ember.computed('specialSlots.@each', function () {
    let ref = {};
    let slotsByDates = [];
    this.get('specialSlots').forEach((slot) => {
      const record = slot.record;
      const dateString = this.getDateStringOf(record);

      if (!ref[dateString]) {
        let aggregate = { 
          dateString,
          date: new Date(record.get('timestamp')),
          note: '', 
          items: [],
          showOptionsMenu: false
        };
        ref[dateString] = aggregate;
        slotsByDates.push(aggregate);
      }

      let aggregate = ref[dateString];
      aggregate.items.push(slot);
      if (record.get('quota') === 0 && record.get('note')) {
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
        record.get('hours') === ts.get('hours') &&
        record.get('minutes') === ts.get('minutes')
      );
    });
  },

  getOpenDateTimeslot(date) {
    return this.get('timeSlots').find(ts => {
      return !this.get('appointmentSlots').find(record => {
        let recordDate = new Date(record.get('timestamp'));
        return (this.sameDay(date, recordDate) && record.get('quota') > 0 && this.getTimeStringOf(record) === ts.get('time'));
      });
    });
  },

  addToQuota(record, num) {
    this.showLoadingSpinner();
    record.set('quota', record.get('quota') + num);
    record.save()
      .catch((response) => {
        record.rollbackAttributes();
        this.onError(response);
      })
      .finally(() => this.hideLoadingSpinner());
  },

  createRecord(modelName, payload) {
    const newRecord = this.get('store').createRecord(modelName, payload);
    this.showLoadingSpinner();
    newRecord.save()
      .catch(r => this.onError(r))
      .finally(() => this.hideLoadingSpinner()); 
  },

  deleteRecords(records) {
    this.showLoadingSpinner();
    RSVP.all(records.map(r => r.destroyRecord()))
      .catch(r => this.onError(r))
      .finally(() => this.hideLoadingSpinner());
  },

  sameDay(d1, d2) {
    return d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();
  },

  showLoadingSpinner() {
    if (!this.loadingView) {
      this.loadingView = Ember.getOwner(this).lookup('component:loading').append();
    }
  },

  hideLoadingSpinner() {
    if (this.loadingView) {
      this.loadingView.destroy();
      this.loadingView = null;
    }
  },

  showError(message, cb) {
    this.get("messageBox").alert(message, cb);
  },

  onError(response) {
    const errors = (response && response.responseJSON && response.responseJSON.errors) || [];
    this.showError(errors[0]);
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
      history.back();
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
      this.createRecord('appointment_slot', { timestamp, note, quota: 0 });    
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
      this.addToQuota(record, 1);
    },

    decreaseQuotaOf(record) {
      if (record.get('quota') > 1) {
        this.addToQuota(record, -1);
      }
    },

    updateSlotTime(slot, day, newTimeSlot) {
      const record = slot.get('record');
      const currentTime = new Date(record.get('timestamp'));
      const updatedTime = new Date(record.get('timestamp'));
      updatedTime.setHours(newTimeSlot.get('hours'));
      updatedTime.setMinutes(newTimeSlot.get('minutes'));

      if (currentTime === updatedTime) { 
        return; /* There hasn't been any change */
      }

      const timeString = newTimeSlot.get('time');
      const resetInput = () => slot.set('timeslot', this.getTimeSlotOf(record));
      const timeslotAlreadyInUse = !!day.items.find(it => this.getTimeStringOf(it.get('record')) === timeString);
      if (timeslotAlreadyInUse) {
        return this.showError("An appointment slot already exists for this time", resetInput);
      }

      this.showLoadingSpinner();
      record.set('timestamp', updatedTime);
      record.save()
        .catch((response) => {
          record.rollbackAttributes();
          resetInput();
          this.onError(response);
        })
        .finally(() => this.hideLoadingSpinner());
    },

    updatePresetTime(item, day, { time, hours, minutes }) {
      const record = item.get('record');
      if (record.get('hours') === hours && record.get('minutes') === minutes) { 
        return; /* There hasn't been any change */
      }

      const resetInput = () => item.set('timeslot', this.getTimeSlotOf(record));

      const timeslotAlreadyInUse = !!day.items.find(it => this.getTimeStringOf(it.get('record')) === time);
      if (timeslotAlreadyInUse) {
        return this.showError("An appointment slot preset already exists for this time", resetInput);
      }

      this.showLoadingSpinner();
      record.set('hours', hours);
      record.set('minutes', minutes);
      record.save()
        .catch((response) => {
          record.rollbackAttributes();
          resetInput();
          this.onError(response);
        })
        .finally(() => this.hideLoadingSpinner());
    },

    deleteRecord(record) {
      this.deleteRecords([ record ]);
    },

    deleteAllItems(items) {
      this.deleteRecords(items.map(it => it.record));
    }
  }
});
