import Ember from 'ember';

export default Ember.Component.extend({
  i18n: Ember.inject.service(),
  allOrderStateFilters: ["showPriority", "submitted", "processing", "scheduled", "dispatching", "closed", "cancelled"],
  allOrderTypeFilters: ["appointments", ["online_orders", ["collection", "dispatch"]], "shipments", "others"],

  //To separate out "showPriority" filter as it has some different css properties than others
  orderStateFilters: Ember.computed('allOrderStateFilters.[]', function() {
    return this.get("allOrderStateFilters").slice(1);
  }),

  //Marks filters as selected depending on pre-selected set of filters
  didInsertElement() {
    var checkedStateFilters = JSON.parse(window.localStorage.getItem('orderStateFilters'));
    var checkedTypeFilters = JSON.parse(window.localStorage.getItem('orderTypeFilters'));
    if(this.get("applyStateFilter") && checkedStateFilters && checkedStateFilters.length) {
      checkedStateFilters.forEach(checkedFilter => Ember.$("#" + checkedFilter)[0].checked = true); // jshint ignore:line
    } else if(this.get("applyTypeFilter") && checkedTypeFilters && checkedTypeFilters.length) {
      checkedTypeFilters.forEach(checkedFilter => Ember.$("#" + checkedFilter)[0].checked = true); // jshint ignore:line
    }
  },

  //For Order Type filters only
  //Marks CheckBox as checked or unchecked depending on value of nested CheckBoxes
  //Currently only works for "online_orders" nested array of Order Type filters
  //Customize this for more than 1 nested array in an array
  click(event) {
    let _this = this;
    let collectionCheckBox = Ember.$("#collection")[0];
    let dispatchedCheckBox = Ember.$("#dispatch")[0];
    let onlineCheckBox = Ember.$("#online_orders")[0];
    let eventTragetName = event.target.innerText;

    if(this.get("applyTypeFilter")) {
      Ember.run.later(function() {
        if(onlineCheckBox.checked && (_this.isOnlineOrderClicked(eventTragetName))) {
          collectionCheckBox.checked = true;
        } else if(!onlineCheckBox.checked && (_this.isOnlineOrderClicked(eventTragetName))) {
          collectionCheckBox.checked = false;
          dispatchedCheckBox.checked = false;
        } else if(!collectionCheckBox.checked && !dispatchedCheckBox.checked
            && (_this.isDispatchClicked(eventTragetName) || _this.isCollectionClicked(eventTragetName))) { // jshint ignore:line
          onlineCheckBox.checked = false;
        } else if((collectionCheckBox.checked || dispatchedCheckBox.checked) && !onlineCheckBox.checked
          && (_this.isDispatchClicked(eventTragetName) || _this.isCollectionClicked(eventTragetName))) { // jshint ignore:line
          onlineCheckBox.checked = true;
        }
      }, 10);
    }
  },

  //Checks if OnlineOrder checkbox text or info is clicked
  isOnlineOrderClicked(eventTragetName) {
    let i18n = this.get("i18n");
    let onlineOrderText = i18n.t("order_filters.online_orders").string;
    let onlineOrderInfo = i18n.t("order_filters.online_orders_info").string;
    return (eventTragetName === onlineOrderInfo || eventTragetName === onlineOrderText);
  },

  //Checks if Dispatch checkbox text or info is clicked
  isDispatchClicked(eventTragetName) {
    let i18n = this.get("i18n");
    let dispatchText = i18n.t("order_filters.dispatch").string;
    let dispatchTextInfo = i18n.t("order_filters.dispatch_info").string;
    return (eventTragetName === dispatchText || eventTragetName === dispatchTextInfo);
  },

  //Checks if Collection checkbox text or info is clicked
  isCollectionClicked(eventTragetName) {
    let i18n = this.get("i18n");
    let collectionText = i18n.t("order_filters.collection").string;
    let collectionInfo = i18n.t("order_filters.collection_info").string;
    return (eventTragetName === collectionText || eventTragetName === collectionInfo);
  },

  //Adds applied filters to localStorage as an array, redirects and has optional Array.flat parameter(Generic for all filters)
  addToLocalStorageAndRedirect(filterType, localStorageName, flatArrayDepth = 0) {
    let appliedFilters = [];
    filterType.flat(flatArrayDepth).forEach(state => {
      if(Ember.$(`#${state}`)[0].checked) {
        appliedFilters.push(state); // jshint ignore:line
      }
    });
    window.localStorage.setItem(localStorageName, JSON.stringify(appliedFilters));
    this.get('router').transitionTo("orders.index");
  },

  //Removes applied filters and has optional Array.flat parameter(Generic for all filters)
  clearFiltersFromLocalStorage(filterType, flatArrayDepth = 0) {
    filterType.flat(flatArrayDepth).forEach(filter => Ember.$("#" + filter)[0].checked = false); // jshint ignore:line
  },

  actions: {
    applyFilters() {
      if(this.get("applyStateFilter")) {
        this.addToLocalStorageAndRedirect(this.get("allOrderStateFilters"), "orderStateFilters");
      } else if(this.get("applyTypeFilter")) {
        this.addToLocalStorageAndRedirect(this.get("allOrderTypeFilters"), "orderTypeFilters", 2);
      }
    },

    clearFilters() {
      if(this.get("applyStateFilter")) {
        this.clearFiltersFromLocalStorage(this.get("allOrderStateFilters"));
      } else if(this.get("applyTypeFilter")) {
        this.clearFiltersFromLocalStorage(this.get("allOrderTypeFilters"), 2);
      }
    }
  }
});
