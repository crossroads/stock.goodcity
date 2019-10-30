import Ember from "ember";
import config from "../../config/environment";
import singletonItemDispatchToGcOrder from "../../mixins/singleton_item_dispatch_to_gc_order";
import GoodcityController from "../goodcity_controller";
import { singularize, pluralize } from "ember-inflector";
import AjaxPromise from "stock/utils/ajax-promise";
import additionalFields from "stock/constants/additional-fields";
import SearchMixin from "stock/mixins/search_resource";
import _ from "lodash";
const { getOwner } = Ember;

export default GoodcityController.extend(
  singletonItemDispatchToGcOrder,
  SearchMixin,
  {
    isMobileApp: config.cordova.enabled,
    backLinkPath: "",
    item: Ember.computed.alias("model"),
    queryParams: ["showDispatchOverlay"],
    previousValue: "",
    dataObjnew: null,
    showDispatchOverlay: false,
    autoDisplayOverlay: false,
    subformDetailService: Ember.inject.service(),
    application: Ember.inject.controller(),
    messageBox: Ember.inject.service(),
    displayScanner: false,
    insertFixedOption: Ember.inject.service(),
    designateFullSet: Ember.computed.localStorage(),
    callOrderObserver: false,
    showSetList: false,
    hideDetailsLink: true,
    currentRoute: Ember.computed.alias("application.currentPath"),
    pkg: Ember.computed.alias("model"),
    fields: additionalFields,

    displayFields: Ember.computed("model.code", function() {
      let subformElement = this.get("model.code.subform");
      if (
        ["computer", "electrical", "computer_accessory"].indexOf(
          subformElement
        ) >= 0
      ) {
        return this.get("fields").additionalFields.filter(function(field) {
          return field.category.includes(subformElement);
        });
      }
    }),

    selectedCountry: Ember.computed("item.detail", function() {
      let country = this.get("item.detail.country");
      if (country) {
        return {
          id: country.id,
          nameEn: country.get("nameEn")
        };
      }
    }),

    selectedValuesDisplay: Ember.computed("item.detail", "dataObjnew", {
      get(key) {
        let dataObj = { ...this.get("dataObjnew") };
        let selectedValues = this.get("item.detail.data");
        let selectedValuesArray = Object.keys(this.get("item.detail.data"));
        selectedValuesArray.map((data, index) => {
          dataObj[data] = {
            id: index + 1,
            tag: selectedValues[data]
          };
        });
        this.set("dataObjnew", { ...dataObj });
        return { ...this.get("dataObjnew") };
      },
      set(key, value) {
        this.set("dataObjnew", null);
        return value;
      }
    }),

    allowMove: Ember.computed(
      "model.isSingletonItem",
      "model.availableQtyForMove",
      function() {
        return (
          this.get("model.isSingletonItem") &&
          this.get("model.availableQtyForMove") > 0
        );
      }
    ),

    allowPublish: Ember.computed(
      "model.isSingletonItem",
      "model.availableQty",
      function() {
        return (
          this.get("model.isSingletonItem") &&
          this.get("model.availableQty") > 0
        );
      }
    ),

    isPackageTypeEditable: Ember.computed("model.code", function() {
      let subformValue = this.get("model.code.subform");
      return (
        ["computer", "electrical", "computer_accessory"].indexOf(
          subformValue
        ) >= 0
      );
    }),

    tabName: Ember.computed("currentRoute", function() {
      return this.get("currentRoute")
        .split(".")
        .get("lastObject");
    }),

    grades: Ember.computed("item.grade", function() {
      let grades = ["A", "B", "C", "D"];
      return grades.map(key => ({
        name: key,
        id: key
      }));
    }),

    conditions: Ember.computed(function() {
      return this.get("store").peekAll("donor_condition");
    }),

    itemMarkedMissing: Ember.observer("item.inventoryNumber", function() {
      if (
        !this.get("item.inventoryNumber") &&
        this.get("target").currentPath === "items.detail"
      ) {
        this.get("messageBox").alert(
          "This item is not inventoried yet or has been marked as missing.",
          () => {
            this.transitionToRoute("items.index");
          }
        );
      }
    }),

    performDispatch: Ember.observer("showDispatchOverlay", function() {
      Ember.run.debounce(this, this.updateAutoDisplayOverlay, 100);
    }),

    updateAutoDisplayOverlay() {
      if (this.get("showDispatchOverlay")) {
        this.toggleProperty("autoDisplayOverlay");
      }
    },

    allDispatched: Ember.computed(
      "item.{isDispatched,isSet,setItem.items.@each.isDispatched}",
      function() {
        if (this.get("item.isSet")) {
          return this.get("item.setItem.allDispatched");
        } else {
          return this.get("item.isDispatched");
        }
      }
    ),

    hasDesignation: Ember.computed(
      "item.{isDesignated,isSet,setItem.items.@each.isDesignated}",
      function() {
        if (this.get("item.isSet")) {
          var allItems = this.get("item.setItem.items");
          return (
            !this.get("item.setItem.allDispatched") &&
            allItems.filterBy("isDesignated").length > 0
          );
        } else {
          return (
            this.get("item.isDesignated") && !this.get("item.isDispatched")
          );
        }
      }
    ),

    sortedOrdersPackages: Ember.computed(
      "model.ordersPackages.[]",
      "model.ordersPackages.@each.state",
      function() {
        // Cancelled orders packages are moved to the bottom
        const records = this.get("model.ordersPackages");
        return [
          ...records.rejectBy("state", "cancelled"),
          ...records.filterBy("state", "cancelled")
        ];
      }
    ),

    actions: {
      /**
       * Called after a property is changed to push the updated
       * record to the API
       */
      persistModel() {
        this.updateRecord(this.get("model"));
      },

      /**
       * Switch to another item of the same set
       *
       * @param {Item} it the newly selected item
       */
      selectItem(it) {
        this.replaceRoute(this.get("currentRoute"), it);
      },

      /**
       * Display/Hide the set list
       */
      toggleSetList() {
        this.toggleProperty("showSetList");
      },

      countryValue(value) {
        const detailType = this.get("item.detailType").toLowerCase();
        const apiEndpoint = pluralize(detailType);
        const detailId = this.get("item.detail.id");
        const url = `/${apiEndpoint}/${detailId}`;
        const snakeCaseKey = "country_id";
        const packageDetailParams = {
          [snakeCaseKey]: parseInt(value.id) || ""
        };
        const paramsObj = {
          detailType,
          url,
          snakeCaseKey,
          packageDetailParams
        };
        this.get("subformDetailService").updateRequest(
          paramsObj,
          ths.get("previousValue")
        );
      },

      /**
       * Switches to the specified tab by navigating to the correct subroute
       *
       * @param {String} tabName The tab we wish to open
       */
      openTab(tabName) {
        this.replaceRoute(`items.detail.${tabName}`);
      },

      setFields(value) {
        this.set("fieldValues", value);
      },

      onSearch(searchText) {
        this.onSearchCountry(searchText);
      },

      openDropDown() {
        let country = this.get("item.detail.country");
        if (country) {
          this.set("previousValue", country.id);
        }
      },

      /**
       * Move the currently viewed item to another location
       * It is configured to act as a singleton (isSet: false),
       * and apply the move exclusively to the current item.
       * The other items of the set should not be affected by it.
       *
       * Note: temporary until we handle per-item per-location partial move
       */
      moveFullPackageQty() {
        this.transitionToRoute("items.search_location", this.get("item.id"), {
          queryParams: {
            isSet: false,
            isPartialMove: true,
            pkgsLocationId: this.get("item.packagesLocations.firstObject.id"),
            skipScreenForSingletonItem: true
          }
        });
      },

      partialDesignateForSet() {
        this.set("designateFullSet", true);
        this.set("callOrderObserver", true);
      },

      moveItemSet() {
        if (this.get("item.isSet")) {
          if (this.get("item.setItem.canBeMoved")) {
            this.transitionToRoute(
              "items.search_location",
              this.get("item.id"),
              {
                queryParams: {
                  isSet: true
                }
              }
            );
          } else {
            this.get("messageBox").alert(
              "One or more items from this set are part of box or pallet. You can only move it using Stockit."
            );
          }
        } else {
          this.transitionToRoute("items.search_location", this.get("item.id"), {
            queryParams: {
              isSet: false,
              isPartialMove: false
            }
          });
        }
      }
    }
  }
);
