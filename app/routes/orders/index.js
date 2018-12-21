import AuthorizeRoute from './../authorize';
import Ember from "ember";
import AjaxPromise from 'stock/utils/ajax-promise';

export default AuthorizeRoute.extend({
  filterService: Ember.inject.service(),

  model(params) {
    let filterService = this.get('filterService');

    let filter = filterService.get('getOrderStateFilters');
    let typeFilter = filterService.get('getOrderTypeFilters');
    let isPriority = filterService.isPriority();
    if (isPriority) {
      filter.shift();
    }

    if(!this.session.get("currentUser")) {
      new AjaxPromise("/auth/current_user_profile", "GET", this.session.get("authToken"))
        .then(data => {
          this.store.pushPayload(data);
        });
    }

    if (params.isFiltered) {
      return this.store.query('designation', { state: this.stringifyArray(filter), type:this.stringifyArray(typeFilter), priority: isPriority });
    } else {
      filterService.clearFilters();
      filterService.notifyPropertyChange("getOrderStateFilters");
      filterService.notifyPropertyChange("getOrderTypeFilters");
    }
  },

  stringifyArray(stateOrType) {
    return Array.isArray(stateOrType) ? stateOrType.toString() : '';
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
