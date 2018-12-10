import AuthorizeRoute from './../authorize';
import Ember from "ember";
import AjaxPromise from 'stock/utils/ajax-promise';

export default AuthorizeRoute.extend({
  filterService: Ember.inject.service(),
  utilityMethods: Ember.inject.service(),

  model(params) {
    let filter = this.get('filterService').getOrderStateFilters();
    let isPriority = this.get('filterService').isPriority();
    if (isPriority) {
      filter.shift();
    }

    if(!this.session.get("currentUser")) {
      new AjaxPromise("/auth/current_user_profile", "GET", this.session.get("authToken"))
        .then(data => {
          this.store.pushPayload(data);
        });
    }

    if (this.get("utilityMethods").arrayExists(filter) && params.isFiltered) {
      return this.store.query('designation', { state: filter.toString(), priority: isPriority });
    }
  },

  setupController(controller, model) {
    this._super(controller, model);
    if (model) {
      model.forEach(record => {
        controller.onItemLoaded(record);
      });
      controller.set("filteredResults", model);
    }
  },

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('isFiltered', undefined);
      controller.set("filteredResults", "");
    }
  }
});
