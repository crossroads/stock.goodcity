import Ember from 'ember';
import SessionRoute from './session';
import AjaxPromise from 'stock/utils/ajax-promise';

export default SessionRoute.extend({
  model() {
    let isOrderFulfilmentRole = this.get('session.currentUser.isOrderFulfilmentUser');

    var recentlyUsedDesignations = this.get('store').query('designation', { shallow: true, recently_used: true });
    var recentlyUsedLocations = this.get('store').query('location', { recently_used: true });
    recentlyUsedDesignations.forEach(record => {
        if(record.constructor.toString() === "stock@model:designation:") {
          this.store.query("orders_package", { search_by_order_id: record.get("id")
        });
        }
      });
    this.get('store').pushPayload(recentlyUsedDesignations);
    this.get('store').pushPayload(recentlyUsedLocations);

    if (isOrderFulfilmentRole) {
      return Ember.RSVP.hash({
        ordersCount: new AjaxPromise("/orders/summary", "GET", this.session.get("authToken")),
        recentlyUsedDesignations: recentlyUsedDesignations
      });
    }
  }
});
