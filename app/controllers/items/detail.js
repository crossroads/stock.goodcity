import Ember from "ember";
import config from "stock/config/environment";
import GoodcityController from "../goodcity_controller";
import { pluralize } from "ember-inflector";
import additionalFields from "stock/constants/additional-fields";
import SearchOptionMixin from "stock/mixins/search_option";
import PackageDetailMixin from "stock/mixins/fetch_package_detail";
import GradeMixin from "stock/mixins/grades_option";
import MoveActions from "stock/mixins/move_actions";
import DesignationActions from "stock/mixins/designation_actions";
import AsyncMixin from "stock/mixins/async";
import StorageTypes from "stock/mixins/storage-type";
import _ from "lodash";

export default GoodcityController.extend(
  SearchOptionMixin,
  PackageDetailMixin,
  GradeMixin,
  MoveActions,
  DesignationActions,
  StorageTypes,
  AsyncMixin,
  {
    isMobileApp: config.cordova.enabled,
    backLinkPath: "",
    previousValue: "",
    openAddItemOverlay: false,
    addableItem: null,
    removableItem: null,
    subformDataObject: null,
    item: Ember.computed.alias("model"),
    queryParams: ["showDispatchOverlay"],
    showDispatchOverlay: false,
    autoDisplayOverlay: false,
    subformDetailService: Ember.inject.service(),
    application: Ember.inject.controller(),
    messageBox: Ember.inject.service(),
    setDropdownOption: Ember.inject.service(),
    designationService: Ember.inject.service(),
    settings: Ember.inject.service(),
    packageService: Ember.inject.service(),
    locationService: Ember.inject.service(),
    displayScanner: false,
    designateFullSet: Ember.computed.localStorage(),
    callOrderObserver: false,
    showSetList: false,
    hideDetailsLink: true,
    fields: additionalFields,
    fixedDropdownArr: [
      "frequencyId",
      "voltageId",
      "compTestStatusId",
      "testStatusId"
    ],
    currentRoute: Ember.computed.alias("application.currentPath"),
    pkg: Ember.computed.alias("model"),
    showPieces: Ember.computed.alias("model.code.allow_pieces"),

    isItemDetailPresent() {
      return !!this.get("item.detail.length");
    },

    disableBoxPalletItemAddition: Ember.computed("model", function() {
      return this.get("settings.disableBoxPalletItemAddition");
    }),

    displayFields: Ember.computed("model.code", function() {
      let subform = this.get("model.code.subform");
      return this.returnDisplayFields(subform);
    }),

    selectedCountry: Ember.computed("item.detail", function() {
      let country = this.get("item.detail.country");
      if (country) {
        return {
          id: country.id,
          nameEn: country.get("nameEn")
        };
      }
    }).volatile(),

    returnSelectedValues(selectedValues) {
      let dataObj = {
        ...this.get("subformDataObject")
      };
      Object.keys(selectedValues).map((data, index) => {
        if (this.get("fixedDropdownArr").indexOf(data) >= 0) {
          let subformColumn = `${data.substring(0, data.length - 2)}`;
          dataObj[subformColumn] = {
            id: this.get(`item.detail.${data}`),
            tag: this.get(`item.detail.${subformColumn}.labelEn`)
          };
        } else {
          dataObj[data] = {
            id: index + 1,
            tag: selectedValues[data]
          };
        }
      });
      return { ...dataObj };
    },

    selectedValuesDisplay: Ember.computed("item.detail", "subformDataObject", {
      get(key) {
        if (!this.get("showAdditionalFields")) {
          return false;
        }
        let selectedValues = this.get("item.detail.data");
        let returnData = this.returnSelectedValues(selectedValues);
        this.set("subformDataObject", {
          ...returnData
        });
        return this.get("subformDataObject");
      },
      set(key, value) {
        this.set("subformDataObject", null);
        return value;
      }
    }),

    allowPublish: Ember.computed(
      "model.isSingletonItem",
      "model.availableQty",
      function() {
        const qty = this.get("model.availableQty");
        if (this.get("settings.onlyPublishSingletons")) {
          return qty === 1;
        }
        return qty > 0;
      }
    ),

    showAdditionalFields: Ember.computed("model.code", function() {
      return (
        !!this.get("item.detail.data") &&
        this.get("subformDetailService").isSubformAvailable(
          this.get("model.code.subform")
        )
      );
    }),

    tabName: Ember.computed("currentRoute", function() {
      return this.get("currentRoute")
        .split(".")
        .get("lastObject");
    }),

    selectInfoTab: Ember.computed("tabName", function() {
      return (
        ["storage_detail", "storage_content", "info"].indexOf(
          this.get("tabName")
        ) > -1
      );
    }),

    listTabSelected: Ember.computed("tabName", function() {
      return ["storage_content", "info"].indexOf(this.get("tabName")) > -1;
    }),

    isBoxOrPallet: Ember.computed("item", function() {
      return ["Box", "Pallet"].indexOf(this.get("item.storageTypeName")) > -1;
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

    associatedPackageTypes: Ember.computed("item", function() {
      return this.get("packageService").allChildPackageTypes(this.get("item"));
    }),

    /**
     * Removes an item from a box/pallet
     * @param { Item } pkg The package we wish to remove from the box/pallet
     */
    selectLocationAndUnpackItem(location_id, quantity) {
      let item = this.get("removableItem");
      if (!location_id) {
        return false;
      }
      if (item) {
        const params = {
          item_id: item.id,
          location_id: location_id,
          task: "unpack",
          quantity: quantity
        };
        this.get("packageService").addRemoveItem(this.get("item.id"), params);
      }
      this.send("fetchContainedPackages");
    },

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

      /**
       * Fetches all the assoicated packages to a box/pallet
       */
      fetchContainedPackages() {
        return this.runTask(async () => {
          const data = await this.get("packageService").fetchContainedPackages(
            this.get("item.id")
          );
          this.get("store").pushPayload(data);
          this.set("associatedPackages", data.items);
        });
      },

      openItemsSearch(item) {
        this.get("packageService").openItemsSearch(item);
      },

      async openLocationSearch(item, quantity) {
        this.set("removableItem", item);
        let selectedLocation = await this.get(
          "locationService"
        ).userPickLocation();
        if (!selectedLocation) {
          return;
        }
        this.selectLocationAndUnpackItem(selectedLocation.id, quantity);
      },

      openAddItemOverlay(item) {
        this.set("openAddItemOverlay", true);
        this.set("addableItem", item);
      },

      /**
       * Switches to the specified tab by navigating to the correct subroute
       *
       * @param {String} tabName The tab we wish to open
       */
      openTab(tabName) {
        this.replaceRoute(`items.detail.${tabName}`);
      },

      setCountryValue(value) {
        const config = {
          value: value.id,
          name: "country_id",
          previousValue: this.get("previousValue")
        };
        this.send("updateFields", config);
      },

      updateFields(config) {
        const detailType = _.snakeCase(
          this.get("item.detailType")
        ).toLowerCase();
        const apiEndpoint = pluralize(detailType);
        const detailId = this.get("item.detail.id");
        const url = `/${apiEndpoint}/${detailId}`;
        const snakeCaseKey = _.snakeCase(config.name);
        const packageDetailParams = {
          [snakeCaseKey]: config.value
        };
        const paramsObj = {
          detailType,
          url,
          snakeCaseKey,
          packageDetailParams
        };
        return this.get("subformDetailService").updateRequest(
          paramsObj,
          config.previousValue
        );
      },

      openDropDown() {
        let country = this.get("item.detail.country");
        if (country) {
          this.set("previousValue", country.id);
        }
      },
      onSearch(field, searchText) {
        this.onSearchCountry(field, searchText);
      }
    }
  }
);
