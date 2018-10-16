import Ember from "ember";
import config from '../../config/environment';
import searchModule from "../search_module";
import AjaxPromise from 'stock/utils/ajax-promise';
const { getOwner } = Ember;

export default searchModule.extend({

  queryParams: ['searchInput', 'isSet', 'isUndispatch', 'isPartialMove', 'ordersPackageId', 'pkgsLocationId', 'skipScreenForSingletonItem'],
  isSet: false,
  orderIdForOrderDetail: null,
  ordersPackageId: null,
  isMobileApp: config.cordova.enabled,
  searchInput: "",
  moveItemPath: "",
  packages_location_id: "",
  packagesLocationQty: Ember.computed.localStorage(),
  movePartialQty: false,
  cantMoveToSameLocationForSingleLocation: false,
  isUndispatch: "",
  isUndispatchFullQuantity: false,
  isPartialMove: false,
  skipScreenForSingletonItem: false,
  pkgsLocationId: null,

  item: Ember.computed.alias("model.item"),
  searchModelName: "location",
  messageBox: Ember.inject.service(),

  sortProperties: ["recentlyUsedAt:desc"],
  sortedRecentlyUsedLocations: Ember.computed.sort("recentlyUsedLocations", "sortProperties"),

  recentlyUsedLocations: Ember.computed('model.locations', function(){
    return this.get('model.locations');
  }),

  displayUserPrompt: false,
  showAllSetItems: false,
  selectedLocation: null,
  hideDetailsLink: true,

  sameSingleLocation: Ember.computed("selectedLocation", 'displayUserPrompt',  'isPartialMove', function() {
    if (this.get('item.packagesLocations.length') === 1){
     return this.get('item.packagesLocations.firstObject.locationId') === parseInt(this.get('selectedLocation.id'), 10);
    }
  }),

  totalQty: Ember.computed('selectedLocation', function(){
    var packagesLocationQty = localStorage['packagesLocationQty'];
    if(packagesLocationQty){
      var existingPackagesLocation = JSON.parse(packagesLocationQty).findBy('location_id', parseInt(this.get('selectedLocation.id'), 10));
      if(existingPackagesLocation){
        return localStorage['totalQty'] - existingPackagesLocation['new_qty'];
      } else {
        return localStorage['totalQty'];
      }
    }
  }),

  onSearchInputChange: Ember.observer("searchInput", function() {
    // wait before applying the filter
    if (this.get("searchInput")) {
      Ember.run.debounce(this, this.applyFilter, 0);
    }
  }),

  applyFilter() {
    var searchText = this.get("searchText");
    if (searchText.length > 0) {
      this.set("isLoading", true);
      this.set("hasNoResults", false);
      if(this.get("unloadAll")) { this.get("store").unloadAll(); }

      this.infinityModel("location",
        { perPage: 25, startingPage: 1, modelPath: 'filteredResults',stockRequest: true },
        { searchText: "searchText", itemId: "itemSetId" })
        .then(data => {
          if(this.get("searchText") === data.meta.search) {
            this.set("filteredResults", data);
            this.set("hasNoResults", data.get("length") === 0);
          }

          if(data.get("length") === 1) {
            this.set("selectedLocation", data.get('firstObject'));
            Ember.run.debounce(this, this.triggerDisplayMoveOverlay, 100);
          }
        })
        .finally(() => this.set("isLoading", false));
    }
    this.set("filteredResults", []);
  },

  triggerDisplayMoveOverlay(){
    this.set("displayUserPrompt", true);
  },

  actions: {
    displayMoveOverlay(location) {
      var item = this.get("item");
      this.set("selectedLocation", location);
      if(item.get("hasBoxPallet")) {
        this.get("messageBox").alert("This item is in box or pallet. You can only move it using Stockit.", () => {
          this.transitionToRoute('items.detail', item.get("id"));
        });
      } else if(this.get('sameSingleLocation')){
        this.set('cantMoveToSameLocationForSingleLocation', true);
      } else if(this.get('isUndispatch')){
        this.set('isUndispatchFullQuantity', true);
      } else if(this.get('isPartialMove')){
        this.set('movePartialQty', true);
      } else{
        this.set("displayUserPrompt", true);
      }
    },

    movePartialQty(){
      var location = this.get("selectedLocation");
      var item = this.get("item");
      var packagesLocationQty = [];
      var totalQty = '';
      if(this.get('skipScreenForSingletonItem')) {
        var record = {};
        var packages_location = this.get('store').peekRecord('packages_location', this.get('pkgsLocationId'));
        record["packages_location_id"] = this.get('pkgsLocationId');
        record["location_id"] = packages_location.get('locationId');
        record["package_id"] = packages_location.get('packageId');
        record["new_qty"] = "1";
        packagesLocationQty.push(record);
        this.set("packagesLocationQty", packagesLocationQty);
        record = {};
        totalQty = "1";
      } else {
        totalQty = localStorage["totalQty"];
      }

      packagesLocationQty = localStorage['packagesLocationQty'];

      var loadingView = getOwner(this).lookup('component:loading').append();

      var url = `/items/${item.id}/move_partial_quantity`;
      var path = item.isSingletonItem ? "items.detail" : "items.partial_move";

      new AjaxPromise(url, "PUT", this.get('session.authToken'), { location_id: location.get("id"), package: packagesLocationQty, total_qty: totalQty}).then(data => {
        this.get("store").pushPayload(data);
        this.transitionToRoute(path, item);
      }).finally(() => {
        loadingView.destroy();
        var recentlyUsedLocations = this.get('store').query('location', { recently_used: true });
        this.get('store').pushPayload(recentlyUsedLocations);
      });
    },

    undispatchFullQuantity(){
      var item = this.get('item');
      var location = this.get("selectedLocation");

      var url = `/items/${item.get('id')}/move_full_quantity`;
      var loadingView = getOwner(this).lookup('component:loading').append();

      new AjaxPromise(url, "PUT", this.get('session.authToken'), { location_id: location.get('id'), ordersPackageId: this.get("ordersPackageId")}).then(data => {
        this.get("store").pushPayload(data);
        var itemBackLinkPath = this.get('moveItemPath');
        if(itemBackLinkPath === "items.index" || itemBackLinkPath === "items"){
          this.transitionToRoute(itemBackLinkPath);
        } else {
          this.transitionToRoute("items.detail", item);
        }
      })
      .catch((response) => {
        loadingView.destroy();
        var errorMessage
        if(response.responseJSON.errors) {
          errorMessage = response.responseJSON.errors[0];
        }
        if(errorMessage && errorMessage.toLowerCase().indexOf("error") >= 0) {
          this.get("messageBox").alert(errorMessage);
        }
      }).finally(() => {
        loadingView.destroy();
      });
    },

    moveItem() {
      var location = this.get("selectedLocation");
      var item = this.get("item");
      var packagesLocationQty = [];
      if(this.get('skipScreenForSingletonItem')) {
        var record = {};
        var packages_location = this.get('store').peekRecord('packages_location', this.get('pkgsLocationId'));
        record["packages_location_id"] = this.get('pkgsLocationId');
        record["location_id"] = packages_location.get('locationId');
        record["package_id"] = packages_location.get('packageId');
        record["new_qty"] = "1";
        packagesLocationQty.push(record);
        this.set("packagesLocationQty", packagesLocationQty);
        record = {};
      }

      packagesLocationQty = localStorage['packagesLocationQty'];


      var showAllSetItems = this.get("showAllSetItems");
      this.set("showAllSetItems", false);

      var loadingView = getOwner(this).lookup('component:loading').append();
      var url;
      if(this.get("isSet")) {
        url = `/items/${item.get('setItem.id')}/move_stockit_item_set`;
      } else {
        url = `/items/${item.get('id')}/move_stockit_item`;
      }

      new AjaxPromise(url, "PUT", this.get('session.authToken'), { location_id: location.get("id"), packages_location_and_qty: packagesLocationQty} )
        .then(data => {
          var itemBackLinePath = this.get('moveItemPath');
          this.get("store").pushPayload(data);
          if(showAllSetItems) {
            this.transitionToRoute("items", {queryParams: { itemSetId: item.get("itemId") } });
          } if(itemBackLinePath === "items.index") {
            this.transitionToRoute(itemBackLinePath);
          } else {
            this.transitionToRoute("items.detail", item);
          }
        })
        .catch((response) => {
          loadingView.destroy();
          var errorMessage = response.responseJSON.errors[0];
          if(errorMessage.toLowerCase().indexOf("error") >= 0) {
            this.get("messageBox").alert(errorMessage);
          }
        })
        .finally(() => {
          loadingView.destroy();
        });
    }
  }
});
