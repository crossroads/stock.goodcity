import detail from "./detail";
import Ember  from 'ember';
import _ from 'lodash';

const EMPTY_OPTION = {
  id: '-1',
  value: null,
  name: 'n/a'
};

export default detail.extend({

  stickyNote: {
    showCallToAction: true
  },

  showCallToAction: Ember.computed('model', 'stickyNote.showCallToAction', function() {
    const note = this.get('model.staffNote');
    return !note && this.get('stickyNote.showCallToAction');
  }),

  /**
   * Creates an action that modifies the property of the record passed as argument
   */
  propertyMutator(model, property) {
    return ({ value }) => {
      this.updateRecord(model, { [property]: value });
    };
  },

  /**
   * Transforms a modelName into a list of options for a <select>
   */
  buildOptions(modelName, namer, opts = {}) {
    if (_.isString(namer)) {
      let key = namer;
      namer = (record) => record.get(key); 
    }
    let res = this.store.peekAll(modelName).map(it => ({
      id: it.get('id'),
      value: it,
      name: namer(it)
    }));

    if (opts.allowEmpty) {
      res.unshift(EMPTY_OPTION);
    }

    return res;
  },

  /**
   * SCHEDULE ROW
   */
  makeScheduleRow() {
    const order = this.get('model');
    return {
      label: this.get('i18n').t('order_details.logistics.scheduled'),
      text: moment.tz(order.get('orderTransport.scheduledAt'), "Asia/Hong_Kong").format('dddd Do MMMM hh:mm a'),
      action: 'openSchedulePopup',
      icon: 'clock',
      name: 'reschedule'
    };
  },

  /**
   * TYPE ROW
   */
  makeTypeRow() {
    const order = this.get('model');
    const options = this.buildOptions('booking_type', 'displayName');
    return {
      label: this.get('i18n').t('order_details.logistics.type'),
      action: this.propertyMutator(order, 'bookingType'),
      icon: 'tv',
      name: 'type',
      selectable: true,
      value: options.find(opt => opt.id === order.get('bookingType.id')),
      options: options
    };
  },

  /**
   * TRANSPORT TYPE
   */
  makeTransportRow() {
    const transport = this.get('model.orderTransport');
    const transportType = transport.get('transportType');
    const options = [ 'self', 'ggv' ].map((t,i) => ({
      id: i,
      value: t,
      name: this.get('i18n').t(`order_details.logistics.vehicle.${t}`)
    }));
    return {
      label: this.get('i18n').t('order_details.logistics.transport_type'),
      action: this.propertyMutator(transport, 'transportType'),
      icon: 'file-invoice-dollar',
      name: 'transport_type',
      selectable: true,
      value: options.filterBy('value', transportType).get('firstObject'),
      options: options
    };
  },

  /**
   * DISTRICT
   */
  makeDistrictRow() {
    const order = this.get('model');  
    const options = this.buildOptions('district', 'name', { allowEmpty: true });
    return {
      label: this.get('i18n').t('order_details.logistics.destination'),
      action: this.propertyMutator(order, 'district'),
      icon: '',
      name: 'district',
      selectable: true,
      value: options.find(opt => opt.id === order.get('district.id')),
      options: options
    };
  },

  /**
   * VEHICLE
   */
  makeVehicleRow() {
    const orderTransport = this.get('model.orderTransport');
    const options = this.buildOptions('gogovan_transport', 'name', { allowEmpty: true });
    return {
      label: this.get('i18n').t('order_details.logistics.vehicle_type'),
      action: this.propertyMutator(orderTransport, 'gogovanTransport'),
      icon: '',
      name: 'vehicle',
      selectable: true,
      value: options.find(opt => opt.id === orderTransport.get('gogovanTransport.id')),
      options: options
    };
  },

  logisticDataRows: Ember.computed('model', 'model.orderTransport.scheduledAt', function () {
    return [
      this.makeScheduleRow(),
      this.makeTypeRow(),
      this.makeTransportRow(),
      this.makeDistrictRow(),
      this.makeVehicleRow()
    ];
  }),

  actions: {
    hideNoteCallToAction() {
      this.set('stickyNote.showCallToAction', false);
    },
    showNoteCallToAction() {
      this.set('stickyNote.showCallToAction', true);
    },
    onStickyNoteChanged() {
      this.set('stickyNote.showSaveButton', true);
    },
    saveStickyNote() {
      const order = this.get('model');
      this.updateRecord(order, {}, { 
        noRollback: true,
        onSuccess: () => {
          this.set('stickyNote.showSaveButton', false);
          if (!order.get('staffNote')) {
            this.send('showNoteCallToAction');
          }
        }
      });
    }
  }
});