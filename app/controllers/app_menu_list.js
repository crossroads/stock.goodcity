import Ember from 'ember';
const { getOwner } = Ember;
import AjaxPromise from 'stock/utils/ajax-promise';

export default Ember.Controller.extend({
  application: Ember.inject.controller(),

  getCurrentUser: Ember.computed(function(){
    var store = this.get('store');
    var currentUser = store.peekAll('user_profile').get('firstObject') || null;
    return currentUser;
  }).volatile(),

  actions: {
    logMeOut() {
      this.get('application').send('logMeOut');
    },

    createOrder() {
      let orderParams = { authorised_by_id: this.get('getCurrentUser.id'), state: 'draft', detail_type: "GoodCity" };
      let loadingView = getOwner(this).lookup('component:loading').append();

      new AjaxPromise("/orders", 'POST', this.get('session.authToken'), { order: orderParams }).then((data)=> {
        let orderId = data.designation.id;
        this.store.pushPayload(data);
        this.transitionToRoute("order.search_users", orderId);
      })
      .finally(() => loadingView.destroy());
    }
  }
});
