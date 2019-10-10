import Ember from "ember";
import config from "../../config/environment";
import singletonItemDispatchToGcOrder from "../../mixins/singleton_item_dispatch_to_gc_order";
import GoodcityController from "../goodcity_controller";

export default GoodcityController.extend(singletonItemDispatchToGcOrder, {
  isMobileApp: config.cordova.enabled,
  backLinkPath: "",
  item: Ember.computed.alias("model"),
  queryParams: ["showDispatchOverlay"],
  showDispatchOverlay: false,
  autoDisplayOverlay: false,
  application: Ember.inject.controller(),
  messageBox: Ember.inject.service(),
  displayScanner: false,
  designateFullSet: Ember.computed.localStorage(),
  callOrderObserver: false,
  showSetList: false,
  hideDetailsLink: true,

  currentRoute: Ember.computed.alias("application.currentPath"),
  pkg: Ember.computed.alias("model"),

  displayFieldsObj: [
    {
      label: "Brand",
      name: "brand",
      value: "brand",
      type: "text",
      autoComplete: false,
      category: ["computer", "computer_accessory", "electrical"],
      addAble: true
    },
    {
      label: "Model",
      name: "model",
      type: "text",
      value: "model",
      autoComplete: false,
      category: ["computer", "computer_accessory", "electrical"],
      addAble: false
    },
    {
      label: "Serial Number",
      name: "serialNumber",
      type: "text",
      value: "serialNumber",
      autoComplete: false,
      category: ["computer", "computer_accessory", "electrical"],
      addAble: false
    },
    {
      label: "Country of origin",
      name: "country",
      type: "number",
      value: "country",
      autoComplete: false,
      category: ["computer", "computer_accessory", "electrical"],
      addAble: false
    },
    {
      label: "Size",
      name: "size",
      type: "text",
      value: "size",
      autoComplete: false,
      category: ["computer", "computer_accessory"],
      addAble: true
    },
    {
      label: "Cpu",
      name: "cpu",
      type: "text",
      value: "cpu",
      autoComplete: false,
      category: ["computer"],
      addAble: true
    },
    {
      label: "Comp Test Status",
      name: "compTestStatus",
      type: "text",
      value: "compTestStatus",
      autoComplete: false,
      category: ["computer", "computer_accessory"],
      addAble: false
    },
    {
      label: "Ram",
      name: "ram",
      type: "text",
      value: "ram",
      autoComplete: false,
      category: ["computer"],
      addAble: true
    },
    {
      label: "HDD",
      name: "hdd",
      type: "text",
      value: "hdd",
      autoComplete: false,
      category: ["computer"],
      addAble: true
    },
    {
      label: "Optical",
      name: "optical",
      type: "text",
      value: "optical",
      autoComplete: false,
      category: ["computer"],
      addAble: true
    },
    {
      label: "video",
      name: "video",
      type: "text",
      value: "video",
      autoComplete: false,
      category: ["computer"],
      addAble: true
    },
    {
      label: "Sound",
      name: "sound",
      type: "text",
      value: "sound",
      autoComplete: false,
      category: ["computer"],
      addAble: true
    },
    {
      label: "Lan",
      name: "lan",
      type: "text",
      value: "lan",
      autoComplete: false,
      category: ["computer"],
      addAble: true
    },
    {
      label: "Wireless",
      name: "wireless",
      type: "text",
      value: "wireless",
      autoComplete: false,
      category: ["computer"],
      addAble: true
    },
    {
      label: "Usb",
      name: "usb",
      type: "text",
      value: "usb",
      autoComplete: false,
      category: ["computer"],
      addAble: true
    },
    {
      label: "Comp Voltage",
      name: "compVoltage",
      type: "text",
      value: "compVoltage",
      autoComplete: false,
      category: ["computer", "computer_accessory"],
      addAble: true
    },
    {
      label: "OS",
      name: "os",
      type: "text",
      value: "os",
      autoComplete: false,
      category: ["computer"],
      addAble: true
    },
    {
      label: "OS Serial Num",
      name: "os_serial_num",
      type: "text",
      value: "osSerialNum",
      autoComplete: false,
      category: ["computer"],
      addAble: false
    },
    {
      label: "Ms Office Serial Num",
      name: "ms_office_serial_num",
      type: "text",
      value: "msOfficeSerialNum",
      autoComplete: false,
      category: ["computer"],
      addAble: false
    },
    {
      label: "Mar  OS serial Num",
      name: "mar_os_serial_num",
      type: "text",
      value: "marOsSerialNum",
      autoComplete: false,
      category: ["computer"],
      addAble: false
    },
    {
      label: "Mar Ms Office Serial Num",
      name: "mar_ms_office_serial_num",
      type: "text",
      value: "marMsOfficeSerialNum",
      autoComplete: false,
      category: ["computer"],
      addAble: false
    },
    {
      label: "Interface",
      name: "interface",
      type: "text",
      value: "interface",
      autoComplete: false,
      category: ["computer_accessory"],
      addAble: false
    },
    {
      label: "Standard",
      name: "standard",
      type: "text",
      value: "standard",
      autoComplete: false,
      category: ["computer_accessory"],
      addAble: true
    },
    {
      label: "Voltage",
      name: "voltage",
      type: "number",
      value: "voltage",
      autoComplete: false,
      category: ["electrical"],
      addAble: false
    },
    {
      label: "Power",
      name: "power",
      type: "text",
      value: "power",
      autoComplete: false,
      category: ["electrical"],
      addAble: true
    },
    {
      label: "System or Region",
      name: "systemOrRegion",
      type: "text",
      value: "systemOrRegion",
      autoComplete: false,
      category: ["electrical"],
      addAble: true
    },
    {
      label: "Standard",
      name: "standard",
      type: "text",
      value: "Standard",
      autoComplete: false,
      category: ["electrical"],
      addAble: true
    },
    {
      label: "Test Status",
      name: "testStatus",
      type: "text",
      value: "testStatus",
      autoComplete: true,
      category: ["electrical"],
      addAble: false
    },
    {
      label: "Frequency",
      name: "frequency",
      type: "number",
      value: "frequency",
      autoComplete: false,
      category: ["electrical"],
      addAble: false
    }
  ],

  displayFields: Ember.computed("model.code", function() {
    let _this = this;
    let subformValue = this.get("model.code.subform");
    if (
      ["computer", "electrical", "computer_accessory"].indexOf(subformValue) >=
      0
    ) {
      return this.displayFieldsObj.filter(function(field) {
        return field.category.includes(subformValue);
      });
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
        this.get("model.isSingletonItem") && this.get("model.availableQty") > 0
      );
    }
  ),

  isPackageTypeEditable: Ember.computed("model.code", function() {
    let subformValue = this.get("model.code.subform");
    if (
      ["computer", "electrical", "computer_accessory"].indexOf(subformValue) >=
      0
    ) {
      return true;
    }
  }),

  tabName: Ember.computed("currentRoute", function() {
    return this.get("currentRoute")
      .split(".")
      .get("lastObject");
  }),

  grades: Ember.computed("item.grade", function() {
    return [
      {
        name: "A",
        id: "A"
      },
      {
        name: "B",
        id: "B"
      },
      {
        name: "C",
        id: "C"
      },
      {
        name: "D",
        id: "D"
      }
    ];
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
        return this.get("item.isDesignated") && !this.get("item.isDispatched");
      }
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

    /**
     * Switches to the specified tab by navigating to the correct subroute
     *
     * @param {String} tabName The tab we wish to open
     */
    openTab(tabName) {
      this.replaceRoute(`items.detail.${tabName}`);
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
          this.transitionToRoute("items.search_location", this.get("item.id"), {
            queryParams: {
              isSet: true
            }
          });
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
});
