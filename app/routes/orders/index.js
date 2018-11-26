import AuthorizeRoute from './../authorize';
import AjaxPromise from 'stock/utils/ajax-promise';

export default AuthorizeRoute.extend({
  model(params) {
    if (params.filteredOrders) {
      this.set('params', params.filteredOrders);
    }
    if(!this.session.get("currentUser")) {
      return new AjaxPromise("/auth/current_user_profile", "GET", this.session.get("authToken"))
        .then(data => {
          this.store.pushPayload(data);
        });
    }
  },

  setupController(controller, model) {
    this._super(controller, model);
    controller.set('params', this.get('params'));
  }
});
