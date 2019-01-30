import Ember from 'ember';/* jshint ignore */
import SessionRoute from './session';
import AjaxPromise from 'stock/utils/ajax-promise';/* jshint ignore*/

export default SessionRoute.extend({
  /* jshint ignore:start */
  async model() {
    let canViewDashboard = this.get('session.currentUser.canViewDashboard');
    let store = this.store;

    var recentlyUsedDesignations = await store.query('designation', { shallow: true, recently_used: true });
    var recentlyUsedLocations = store.query('location', { recently_used: true });
    recentlyUsedDesignations.forEach(record => {
      if(record.constructor.toString() === "stock@model:designation:") {
        store.query("orders_package", { search_by_order_id: record.get("id")});
      }
    });
    recentlyUsedDesignations.forEach(record => {
      //let createdByUser =  store.peekRecord("user", record.get('createdById')) || store.findRecord("user", record.get('createdById'), { reload: false });
      let createdByUser =  store.findRecord("user", record.get('createdById'), { reload: false });
      store.pushPayload(createdByUser);
    });
    store.pushPayload(recentlyUsedDesignations);
    store.pushPayload(recentlyUsedLocations);

    if (canViewDashboard) {
      return Ember.RSVP.hash({
        ordersCount: new AjaxPromise("/orders/summary", "GET", this.session.get("authToken")),
        recentlyUsedDesignations: recentlyUsedDesignations
      });
    }
  }
  /* jshint ignore:end */
});
