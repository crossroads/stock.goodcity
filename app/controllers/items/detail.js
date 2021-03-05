import Ember from "ember";
import config from "stock/config/environment";
import GoodcityController from "../goodcity_controller";
import { pluralize } from "ember-inflector";
import additionalFields from "stock/constants/additional-fields";
import SearchOptionMixin from "stock/mixins/search_option";
import PackageDetailMixin from "stock/mixins/fetch_package_detail";
import GradeMixin from "stock/mixins/grades_option";
import MoveActions from "stock/mixins/move_actions";
import StorageTypes from "stock/mixins/storage-type";
import AsyncMixin, { ERROR_STRATEGIES } from "stock/mixins/async";
import ItemActions from "stock/mixins/item_actions";
import _ from "lodash";
import SearchMixin from "stock/mixins/search_resource";

export default GoodcityController.extend(
  SearchOptionMixin,
  PackageDetailMixin,
  GradeMixin,
  MoveActions,
  StorageTypes,
  AsyncMixin,
  ItemActions,
  SearchMixin,
  {
    enableFooterActions: true,
    isMobileApp: config.cordova.enabled,
    backLinkPath: "",
    searchText: null,
    previousValue: "",
    openAddItemOverlay: false,
    addableItem: null,
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
    offerService: Ember.inject.service(),
    packageTypeService: Ember.inject.service(),
    packageService: Ember.inject.service(),
    settings: Ember.inject.service(),
    locationService: Ember.inject.service(),
    settings: Ember.inject.service(),
    session: Ember.inject.service(),
    displayScanner: false,
    callOrderObserver: false,
    hideDetailsLink: true,
    displayItemOptions: false,
    valuationIsFocused: false,
    selectedDescriptionLanguage: "en",
    fields: additionalFields,
    fixedDropdownArr: [
      "frequencyId",
      "voltageId",
      "compTestStatusId",
      "testStatusId"
    ],
    currentRoute: Ember.computed.alias("application.currentPath"),
    pkg: Ember.computed.alias("model"),
    allowItemActions: Ember.computed.alias("settings.allowItemActions"),

    showPieces: Ember.computed(
      "item.code.allow_pieces",
      "isBoxOrPallet",
      function() {
        return this.get("item.code.allow_pieces") && !this.get("isBoxOrPallet");
      }
    ),

    sortActionsBy: ["id:desc"],
    sortedItemActions: Ember.computed.sort(
      "model.itemActions",
      "sortActionsBy"
    ),

    isItemDetailPresent() {
      return !!this.get("item.detail.length");
    },

    packageSetName: Ember.computed(
      "model.code",
      "model.isPartOfSet",
      function() {
        return this.get("model.packageSet.code.name");
      }
    ),

    showSetList: Ember.computed("_showSetList", "model.isPartOfSet", {
      get() {
        return this.get("_showSetList") && this.get("model.isPartOfSet");
      },
      set(k, value) {
        this.set("_showSetList", value);
        return value;
      }
    }),

    disableBoxPalletItemAddition: Ember.computed(
      "model",
      "model.onHandQuantity",
      function() {
        return (
          this.get("settings.disableBoxPalletItemAddition") ||
          !this.get("item.onHandQuantity")
        );
      }
    ),

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

    watchModel: Ember.observer("model.id", "active", function() {
      // Temporary fix
      // The image-zoom carousel sometimes has issues handling switches between two of the same page.
      // Since the controller instance is shared between pages, we turn off the carousel on change
      // and re-enable it once the new model has loaded
      this.set("showImages", false);
      if (this.get("active")) {
        Ember.run.scheduleOnce("afterRender", () => {
          this.set("showImages", this.get("active"));
        });
      }
    }),

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
      "model.availableQuantity",
      function() {
        const qty = this.get("model.availableQuantity");
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

    //Added to avoid gain in box or pallet if the quantity is present in dispatched , designated or available quantity
    isGainInvalidInBoxOrPallet: Ember.computed(
      "model.onHandQuantity",
      "model.dispatchedQuantity",
      "isBoxOrPallet",
      function() {
        return (
          this.get("isBoxOrPallet") &&
          (!!this.get("model.onHandQuantity") ||
            !!this.get("model.dispatchedQuantity"))
        );
      }
    ),

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

    updatePackageOffers(offerIds) {
      this.runTask(
        this.get("packageService").updatePackage(this.get("item.id"), {
          package: {
            offer_ids: offerIds
          }
        })
      );
    },

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

    async deleteAndAssignNew(packageType) {
      const item = this.get("item");
      const type = item.get("detailType");
      const detailId = item.get("detailId");
      if (type) {
        await this.runTask(
          this.get("subformDetailService").deleteDetailType(type, detailId)
        );
      }
      return this.assignNew(packageType, {
        deleteDetailId: !this.isSubformPackage(packageType)
      });
    },

    warnAndAssignNew(pkgType) {
      const existingPkgType = this.get("item.code");
      const packageName = existingPkgType.get("name");
      const newPackageName = pkgType.get("name");
      const translation = this.get("i18n");

      this.get("messageBox").custom(
        translation.t("items.new.subform.delete_subform_waring", {
          newPackageName,
          packageName
        }),
        translation.t("not_now"),
        null,
        translation.t("continue"),
        () => {
          this.deleteAndAssignNew(pkgType);
        }
      );
    },

    isSubformPackage(packageType) {
      return (
        ["computer", "computer_accessory", "electrical", "medical"].indexOf(
          packageType.get("subform")
        ) >= 0
      );
    },

    hasExistingPackageSubform() {
      const code = this.get("item.code");
      return this.isSubformPackage(code);
    },

    async assignNew(type, { deleteDetailId = false } = {}) {
      const item = this.get("item");
      const store = this.get("store");

      const packageParams = {
        package_type_id: type.get("id")
      };
      if (
        !this.isSamePackage(type) ||
        (!item.get("detailId") && this.isSubformPackage(type))
      ) {
        packageParams.detail_type = _.capitalize(type.get("subform"));
      }

      if (deleteDetailId) {
        packageParams.detail_id = null;
      }

      await this.runTask(async () => {
        await this.get("packageService").updatePackage(
          item.id,
          { package: packageParams },
          { reloadDeps: true }
        );
      }, ERROR_STRATEGIES.MODAL);
    },

    isSamePackage(type) {
      const existingPkgTypeSubform = this.get("item.code.subform");
      return type.get("subform") == existingPkgTypeSubform;
    },

    /**
     *
     * @param {Object} item - Model to persist
     * Perform an update action on item. It does a rollback of the item
     * if there is an error encountered
     */
    saveItem(item) {
      this.runTask(async () => {
        try {
          await item.save();
        } catch (e) {
          item.rollbackAttributes();
          throw e;
        }
      }, ERROR_STRATEGIES.MODAL);
    },

    actions: {
      updatePackage(field, value) {
        this.runTask(
          this.get("packageService").updatePackage(this.get("item.id"), {
            package: {
              [field]: value
            }
          })
        );
      },

      setPkgDescriptionLang(langauge) {
        this.set("selectedDescriptionLanguage", langauge);
      },

      /**
       * @param {String} name | Name of the field to update
       * @param {any} value | Value of the field
       * @param {boolean} [isRequired=false] | false by default
       * @param {function} cb | Callback to invoke
       */
      async updateAttribute(name, value, isRequired = false, cb = _.noop) {
        const item = this.get("item");
        if (!value && isRequired) return;
        if (item.changedAttributes()[name]) {
          const params = { package: { [_.snakeCase(name)]: value } };
          await this.runTask(async () => {
            await this.get("packageService").updatePackage(item, params);
          }, ERROR_STRATEGIES.MODAL);
        }
        cb();
      },

      setShowDescSuggestion(val) {
        this.set("showDescriptionSuggestion", val);
      },

      /**
       * Add Offer to Package
       */
      async addOffer() {
        const offer = await this.get("offerService").getOffer();
        const offerIds = [
          ...this.get("item.offersPackages").getEach("offerId"),
          +offer.id
        ].uniq();
        this.updatePackageOffers(offerIds);
      },

      onGradeChange({ id, name }) {
        this.set("selectedGrade", { id, name });
        this.set("defaultValueHkDollar", null);
        this.send("calculateItemValuation");
      },

      onConditionChange({ id, name }) {
        this.set("defaultCondition", { id, name });
        this.set("defaultValueHkDollar", null);
        this.send("calculateItemValuation");
      },

      async calculateItemValuation() {
        const item = this.get("item");
        const itemValuation = await this.get("packageService").getItemValuation(
          {
            donorConditionId:
              this.get("defaultCondition.id") || item.get("donorCondition.id"),
            grade: this.get("selectedGrade.id") || item.get("grade"),
            packageTypeId: item.get("code.id")
          }
        );
        this.set("defaultValueHkDollar", Number(itemValuation.value_hk_dollar));
      },

      /**
       * Remove offer from Package
       * @param {Offer} to be dissociate from Package
       */
      removeOffer(offer) {
        const offerPackage = this.get("item.offersPackages").findBy(
          "offerId",
          +offer.get("id")
        );
        if (offerPackage) {
          this.runTask(offerPackage.destroyRecord());
        }
      },

      /**
       * Removes a package from its set
       * @param {Package} pkg the package to unlink
       */
      unlinkFromSet(pkg) {
        this.runTask(async () => {
          await this.get("packageService").removeFromSet(pkg);

          if (pkg.get("id") === this.get("model.id")) {
            this.set("showSetList", false);
          }
        }, ERROR_STRATEGIES.MODAL);
      },

      async makeCurrentPackageASet() {
        if (this.get("model.isPartOfSet")) {
          return;
        }

        const allowedPackageTypes = this.get("packageTypeService").parentsOf(
          this.get("model.code")
        );

        const code = await this.get("packageTypeService").userPickPackageType({
          storageType: "Package",
          subsetPackageTypes: allowedPackageTypes,
          headerText: this.get("i18n").t("items.select_set_type")
        });

        await this.runTask(async () => {
          await this.get("packageService").initializeSetOf(
            this.get("model"),
            code
          );
        }, ERROR_STRATEGIES.MODAL);

        return this.send("addItemToCurrentSet");
      },

      async addItemToCurrentSet() {
        await this.runTask(
          this.get("packageService").initializeSetOf(this.get("model"))
        );

        const packageSet = this.get("model.packageSet");
        const pkg = await this.get("packageService").userPickPackage({
          parentCode: packageSet.get("code.code"),
          storageTypeName: "Package" // we don't add boxes to sets
        });

        if (!pkg || pkg.get("packageSetId") === packageSet.get("id")) {
          return;
        }

        return this.runTask(async () => {
          await this.get("packageService").addToSet(pkg, packageSet);
        }, ERROR_STRATEGIES.MODAL);
      },

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
      fetchContainedPackages(page = 1) {
        return this.get("packageService")
          .fetchContainedPackages(this.get("item.id"), {
            page: page,
            per_page: 10
          })
          .then(data => {
            this.set("containerQuantity", data.containerQuantity);
            return data.containedPackages;
          });
      },

      /**
       * The callback to be invoked when an item is removed from
       * box / pallet
       */
      reloadItemsInContainer() {
        this.reloadResults();
      },

      async updatePackageType() {
        let pkgType;

        if (this.get("model.isPartOfSet")) {
          pkgType = await this.get("packageTypeService").userPickPackageType({
            subsetPackageTypes: this.get(
              "model.packageSet.code"
            ).defaultChildPackagesList()
          });
        } else {
          pkgType = await this.get("packageTypeService").userPickPackageType({
            storageType: this.get("model.storageTypeName")
          });
        }

        if (this.hasExistingPackageSubform() && !this.isSamePackage(pkgType)) {
          this.warnAndAssignNew(pkgType);
        } else {
          this.assignNew(pkgType);
        }
      },

      fetchParentContainers(pageNo = 1) {
        return this.get("packageService")
          .fetchParentContainers(this.get("item.id"), {
            page: pageNo,
            per_page: 10
          })
          .then(data => {
            return data;
          });
      },

      openItemsSearch() {
        this.set("openPackageSearch", true);
        this.set("parentCode", this.get("item.code.code"));
      },

      async updateContainer(pkg, quantity) {
        if (!quantity) return;

        this.reloadResults();
      },

      setScannedSearchText(searchedText) {
        this.set("searchText", searchedText);
        this.send("openItemsSearch");
      },

      /**
       * Applies the original item valuation when it was loaded.
       * It is like resetting to the value when item was displayed
       */
      async applyDefaultItemValuation() {
        const item = this.get("item");
        item.set("valueHkDollar", this.get("defaultValueHkDollar"));
        this.set("valueHkDollar", this.get("defaultValueHkDollar"));
        await this.saveItem(item);
      },

      /**
       *  Add the default suggested description for selected language
       * @param {string} language - Language EN | Zh-TW
       */
      addDefaultDescriptionFor(language) {
        const item = this.get("item");
        let description = "";
        let name = "";
        if (language === "en") {
          description = this.get("item.code.descriptionEn");
          name = "notes";
        } else {
          description = this.get("item.code.descriptionZhTw");
          name = "notesZhTw";
        }
        item.set(name, description);
        this.send("updateAttribute", name, description);
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
        this.clearMoveParams();
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

      setExpiryDate(value) {
        this.set("item.expiryDate", value.toString());
        this.runTask(this.get("item").save());
      },

      clearExpiryDate() {
        // Need to refer pickadate since this action is out of the
        // calendar-input component
        const picker = Ember.$(".pickadate")
          .pickadate()
          .pickadate("picker");
        picker.clear();
        this.set("item.expiryDate", null);
        this.runTask(this.get("item").save());
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
      },

      async onSaleableChange({ id }) {
        const item = this.get("item");
        const saleable = _.filter(this.get("saleableOptions"), ["name", id])[0]
          .value;
        item.set("saleable", saleable);
        await this.saveItem(item);
      },

      toggleItemOptions() {
        this.toggleProperty("displayItemOptions");
      },

      closeItemOptions() {
        this.set("displayItemOptions", false);
      },

      triggerItemAction(pkg, actionName) {
        this.toggleProperty("displayItemOptions");
        this.send("beginAction", pkg, actionName);
      }
    }
  }
);
