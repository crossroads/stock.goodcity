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

    return this.putPayload(order, {
      orders_process_checklists_attributes: [
        { order_id: order.get('id'), process_checklist_id: item.get('id') }
      ]
    });
  },

  uncheckItem(order, item) {
    let joinRecord = this.getJoinRecordForItem(order, item);
    if (!joinRecord) {
      return;
    }

    return this.putPayload(order, {
      orders_process_checklists_attributes: [
        { id: joinRecord.get('id'), _destroy: true }
      ]
    });
  },

  putPayload(order, payload) {
    let url = `/orders/${order.get('id')}`;
    return new AjaxPromise(url, "PUT", this.get('session.authToken'), { order: payload })
      .then(data => {
        const orderProcessChecklist = data["orders_process_checklists"];
        delete data["orders_process_checklists"];
        if(orderProcessChecklist && orderProcessChecklist.length) {
          orderProcessChecklist.forEach(checklist => {
            _this.get("store").createRecord('orders_process_checklist', {
              id: checklist.id, 
              orderId: checklist.order_id, 
              processChecklistId: checklist.process_checklist_id
            });
          });
        }
        this.get("store").pushPayload(data);
      });
  }
});
