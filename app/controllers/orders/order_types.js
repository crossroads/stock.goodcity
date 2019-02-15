import detail from "./detail";
import Ember  from 'ember';
import _ from 'lodash';

export default detail.extend({

  logisticDataRows: Ember.computed('model', function () {
    const order = this.get('model');
    return [
      // Schedule
      {
        label: this.get('i18n').t('order_details.logistics.scheduled'),
        text: moment.tz(order.get('orderTransport.scheduledAt'), "Asia/Hong_Kong").format('dddd Do MMMM hh:mm a'),
        action: 'openSchedulePopup',
        icon: 'clock',
        name: 'reschedule'
      },
      // Type
      {
        label: this.get('i18n').t('order_details.logistics.type'),
        text: order.get('bookingTypeLabel'),
        action: _.noop,
        icon: 'tv',
        name: 'type'
      },
      // Transport type
      {
        label: this.get('i18n').t('order_details.logistics.transport_type'),
        text: order.get("orderTransport.transportType") === "self" ?
          this.get('i18n').t('order_details.logistics.vehicle.self') :
          this.get('i18n').t('order_details.logistics.vehicle.van'),
        action: _.noop,
        icon: 'file-invoice-dollar',
        name: 'transport_type'
      },
      // District
      {
        label: this.get('i18n').t('order_details.logistics.destination'),
        text: order.get("district.name"),
        action: _.noop,
        icon: '',
        name: 'district'
      },
      // Vehicle
      {
        label: this.get('i18n').t('order_details.logistics.vehicle_type'),
        text: order.get("orderTransport.gogovanTransport.name"),
        action: _.noop,
        icon: '',
        name: 'vehicle'
      }
    ];
  })
});