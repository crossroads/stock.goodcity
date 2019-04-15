import Ember from "ember";

export default Ember.Component.extend({
  i18n: Ember.inject.service(),
  filterService: Ember.inject.service(),

  removeA(arr) {
    var what,
      a = arguments,
      L = a.length,
      ax;
    while (L > 1 && arr.length) {
      what = a[--L];
      while ((ax = arr.indexOf(what)) !== -1) {
        arr.splice(ax, 1);
      }
    }
    return arr;
  },

  //Changes name and css of button depending on filters applied
  didRender() {
    this._super(...arguments);
    let itemStateFilters = this.get("filterService.itemStateFilters");
    if (itemStateFilters && itemStateFilters.length) {
      itemStateFilters = this.removeA(
        itemStateFilters,
        "published_and_private",
        "with_and_without_images"
      );
    }
    let itemLocationFilters = this.get("filterService.itemLocationFilters");
    this.changeCssAndBtnName(
      itemLocationFilters,
      "#item-location-filter",
      "Location"
    );
    this.changeCssAndBtnName(itemStateFilters, "#item-state-filter", "State");
  },

  //Takes applied filters, btnId and type of filter applied
  changeCssAndBtnName(filterData, elementId, filterType) {
    let i18n = this.get("i18n");
    if (filterType === "Location" && filterData && filterData.length) {
      Ember.$(elementId).addClass("filter-button-border");
      Ember.$(elementId).text(filterData);
    } else if (filterData && filterData.length === 1) {
      Ember.$(elementId).addClass("filter-button-border");
      Ember.$(elementId).text(i18n.t(`item_filters.${filterData[0]}`));
    } else if (filterData && filterData.length > 1) {
      Ember.$(elementId).addClass("filter-button-border");
      Ember.$(elementId).text(`${filterType}s : ${filterData.length}`);
    } else {
      Ember.$(elementId).removeClass("filter-button-border");
    }
  },

  actions: {
    redirectTofilters(queryParam) {
      const itemFilter = {};
      itemFilter[queryParam] = true;
      this.get("router").transitionTo("item_filters", {
        queryParams: itemFilter
      });
    }
  }
});
