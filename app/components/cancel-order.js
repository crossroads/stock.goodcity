import Ember from "ember";
import AjaxPromise from 'stock/utils/ajax-promise';
const { getOwner } = Ember;

export default Ember.Component.extend({
  tagName: 'section',
  messageBox: Ember.inject.service(),
  store: Ember.inject.service(),
  order: null,

  actions: {
    deleteOrder() {
      this.get("messageBox").custom(
      "Cancel this Request?",
      "Not Now", null,
      "Cancel Request", () => this.send("removeOrder"));
    },

    removeOrder() {
      let loadingView = getOwner(this).lookup('component:loading').append();
      let orderId = this.get('order.id');
      let url = `/orders/${orderId}`;
      let designation = this.get('store').peekRecord('designation', orderId);

      new AjaxPromise(url, "DELETE", this.get('session.authToken'))
      .then(() => {
        this.get('router').transitionTo("app_menu_list");
        this.get("store").unloadRecord(designation);
      })
      .finally(() => {
        loadingView.destroy();
      });
    }
  }
});
