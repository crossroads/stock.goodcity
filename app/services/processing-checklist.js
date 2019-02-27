import Ember  from "ember";
import DS from 'ember-data';
import AjaxPromise from 'stock/utils/ajax-promise';

function ID(recordOrId) {
  if (recordOrId instanceof DS.Model) {
    return recordOrId.get('id'); // model
  }
  return recordOrId; // id
}

export default Ember.Service.extend({

  store: Ember.inject.service(),
  session: Ember.inject.service(),

  getChecklistForOrder(o) {
    return this.getChecklistForBookingType(o.get('bookingTypeId'));
  },

  getChecklistForBookingType(bt) {
    return this.get('store').peekAll('process-checklist').filterBy("bookingTypeId", ID(bt));
  },

  getJoinRecordForItem(order, item) {
    if (!item) {
      return;
    }
    return order.get('ordersProcessChecklists').find(rec => {
      return Number(item.get('id')) === rec.get('processChecklistId');
    });
  },

  itemChecked(order, item) {
    // We check is there is a join table which points to the processingChecklist item
    return !!this.getJoinRecordForItem(order, item);
  },

  checklistCompleted(order) {
    let itemsToCheck = this.getChecklistForOrder(order);
    for (let item of itemsToCheck) {
      if (!this.itemChecked(order, item)) {
        return false;
      }
    }
    return true;
  },

  checkItem(order, item) {
    if (this.itemChecked(order, item)) {
      return Ember.RSVP.resolve(true);
    }

    let url = `/orders/${order.get('id')}`;
    let payload = {
      orders_process_checklists_attributes: [
        { order_id: order.get('id'), process_checklist_id: item.get('id') }
      ]
    };

    return new AjaxPromise(url, "PUT", this.get('session.authToken'), { order: payload })
      .then(data => {
        this.get("store").pushPayload(data);
      });
  },

  uncheckItem(order, item) {
    let url = `/orders/${order.get('id')}`;
    let joinRecord = this.getJoinRecordForItem(order, item);

    if (!joinRecord) {
      return;
    }

    let payload = {
      orders_process_checklists_attributes: [
        { id: joinRecord.get('id'), _destroy: true }
      ]
    };

    return new AjaxPromise(url, "PUT", this.get('session.authToken'), { order: payload })
      .then(data => {
        this.get("store").pushPayload(data);
      });
  }
});
