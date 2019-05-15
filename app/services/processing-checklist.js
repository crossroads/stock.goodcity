import Ember from "ember";
import DS from "ember-data";
import config from "../config/environment";

function ID(recordOrId) {
  if (recordOrId instanceof DS.Model) {
    return recordOrId.get("id"); // model
  }
  return recordOrId; // id
}

function ajax(method, url, data, headers) {
  // The goodcity lib AjaxPromise does not yet support passing headers to it
  // so this is a temporary workaround.
  // TODO: fix goodcity-lib and remove this
  return new Ember.RSVP.Promise(function(resolve, reject) {
    Ember.$.ajax(
      Ember.$.extend(
        {},
        {
          type: method,
          dataType: "json",
          data: data,
          language: "en",
          url: url.indexOf("http") === -1 ? config.APP.SERVER_PATH + url : url,
          headers: headers,
          success: function(data) {
            Ember.run(function() {
              resolve(data);
            });
          },
          error: function(jqXHR) {
            jqXHR.url = url;
            Ember.run(function() {
              reject(jqXHR);
            });
          }
        }
      )
    );
  });
}

export default Ember.Service.extend({
  store: Ember.inject.service(),
  session: Ember.inject.service(),

  getChecklistForOrder(o) {
    return this.getChecklistForBookingType(o.get("bookingTypeId"));
  },

  getChecklistForBookingType(bt) {
    return this.get("store")
      .peekAll("process-checklist")
      .filterBy("bookingTypeId", ID(bt));
  },

  getJoinRecordForItem(order, item) {
    if (!item) {
      return;
    }
    return order.get("ordersProcessChecklists").find(rec => {
      return Number(item.get("id")) === rec.get("processChecklistId");
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
        { order_id: order.get("id"), process_checklist_id: item.get("id") }
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
        { id: joinRecord.get("id"), _destroy: true }
      ]
    });
  },

  putPayload(order, payload) {
    const url = `/orders/${order.get("id")}`;
    const headers = {
      Authorization: `Bearer ${this.get("session.authToken")}`,
      "Accept-Language": this.get("session.language"),
      "X-GOODCITY-APP-NAME": config.APP.NAME,
      "X-GOODCITY-APP-VERSION": config.APP.VERSION,
      "X-GOODCITY-APP-SHA": config.APP.SHA,
      "X-GOODCITY-DEVICE-ID": this.get("session.deviceId")
    };

    return new ajax("PUT", url, { order: payload }, headers).then(data => {
      this.get("store").pushPayload(data);
    });
  }
});
