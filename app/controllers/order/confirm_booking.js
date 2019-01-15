import Ember from "ember";
import AjaxPromise from 'stock/utils/ajax-promise';
const { getOwner } = Ember;

export default Ember.Controller.extend({
  order: Ember.computed.alias("model.order"),

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
        loadingView.destroy();
        this.transitionToRoute('order.booking_success', this.get("order.id"));
      });
    }
  }
});
