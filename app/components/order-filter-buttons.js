import Ember from "ember";

export default Ember.Component.extend({
  i18n: Ember.inject.service(),
  filterService: Ember.inject.service(),

  //Changes name and css of button depending on filters applied
  didRender() {
    this._super(...arguments);
    let orderTypeFilters = this.get("filterService").get("orderTypeFilters");
    let orderStateFilters = this.get("filterService").get("orderStateFilters");
    this.changeCssAndBtnName(orderTypeFilters, "#order-type-filter", "Type");
    this.changeCssAndBtnName(orderStateFilters, "#order-state-filter", "State");
  },

  //Takes applied filters, btnId and type of filter applied
  changeCssAndBtnName(filterData, elementId, filterType) {
    let i18n = this.get("i18n");
    if (filterData && filterData.length === 1) {
      Ember.$(elementId).addClass("filter-button-border");
      Ember.$(elementId).text(i18n.t(`order_filters.${filterData[0]}`));
    } else if (filterData && filterData.length > 1) {
      Ember.$(elementId).addClass("filter-button-border");
      Ember.$(elementId).text(`${filterType} : ${filterData.length}`);
    } else {
      Ember.$(elementId).removeClass("filter-button-border");
    }
  },

  actions: {
    redirectTofilters(queryParam) {
      const orderFilter = {};
      orderFilter[queryParam] = true;
      this.get("router").transitionTo("order_filters", {
        queryParams: orderFilter
      });
    }
  }
});
