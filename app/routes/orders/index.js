import AuthorizeRoute from './../authorize';
import AjaxPromise from 'stock/utils/ajax-promise';

export default AuthorizeRoute.extend({
  model(params) {
    let filter = JSON.parse(window.localStorage.getItem('orderStateFilters'));
    let newFilterList = [];
    if (filter.includes('showPriority')) {
      for(let i=1;i < filter.length; i++){
        newFilterList.push('showPriority_'+filter[i])
      }
    } else {
      newFilterList = filter;
    }
    if(!this.session.get("currentUser")) {
      new AjaxPromise("/auth/current_user_profile", "GET", this.session.get("authToken"))
        .then(data => {
          this.store.pushPayload(data);
        });
    }
    if (newFilterList.length) {
      return new AjaxPromise("/orders/filtered_order?order_type=" + newFilterList[0], "GET", this.session.get("authToken"))
    }
  },

  setupController(controller, model) {
    this._super(controller, model);
    //controller.set('params', this.get('params'));
    if (model) {
    this.store.pushPayload(model);
      model.designations.forEach(record => {
        controller.onItemLoaded(record);
      });
      controller.set("filteredResults", this.store.peekAll("designation"));
    }
  },

  resetController(controller, isExiting, transition) {
    let UNLOAD_MODELS = ['designation','gc_organisation', 'orders_purpose', 'item','orders_package'];
    UNLOAD_MODELS.forEach( (model) => {
      this.store.unloadAll(model);
    });
  }
});
