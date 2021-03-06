import Ember from "ember";
import AjaxPromise from 'stock/utils/ajax-promise';
import config from '../../config/environment';

const { getOwner } = Ember;

export default Ember.Controller.extend({
  order: Ember.computed.alias("model.order"),
  isMobileApp: config.cordova.enabled,

  actions: {
    confirmBooking(){
      console.log('confirmation');
      var order = this.get('order');
      var loadingView = getOwner(this).lookup('component:loading').append();
      var orderParams = {
        state_event: "submit"
      };
      new AjaxPromise(`/orders/${order.get('id')}`, "PUT", this.get('session.authToken'), { order: orderParams })
      .then(data => {
        this.get("store").pushPayload(data);
        this.transitionToRoute('order.booking_success', this.get("order.id"));
      }).finally( () => loadingView.destroy());
    }
  }
});
