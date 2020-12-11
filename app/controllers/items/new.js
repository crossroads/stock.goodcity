import Ember from "ember";
import AjaxPromise from "stock/utils/ajax-promise";
import GoodcityController from "../goodcity_controller";
import config from "../../config/environment";
import additionalFields from "../../constants/additional-fields";
import _ from "lodash";
import { translationMacro as t } from "ember-i18n";
const { getOwner, A } = Ember;
import SearchOptionMixin from "stock/mixins/search_option";
import PackageDetailMixin from "stock/mixins/fetch_package_detail";
import GradeMixin from "stock/mixins/grades_option";
import AsyncMixin from "stock/mixins/async";

export default GoodcityController.extend(
  SearchOptionMixin,
  PackageDetailMixin,
  GradeMixin,
  AsyncMixin,
  {
    queryParams: ["codeId", "locationId", "scanLocationName", "storageType"],
    codeId: "",
    locationId: "",
    inventoryNumber: "",
    results: "",
    searchText: "",
    dropDownValues: {},
    inputFieldValues: {},
    selected: [],
    countryObj: {},
    countryValue: {},
    scanLocationName: "",
    displayInventoryOptions: false,
    autoGenerateInventory: true,
    inputInventory: false,
    settings: Ember.inject.service(),
    paramsNotCopied: Ember.computed.alias("settings.paramsNotCopied"),
    locationName: Ember.computed.alias("location.displayName"),
    caseNumber: "",
    isSearchCodePreviousRoute: Ember.computed.localStorage(),
    fields: additionalFields,
    weight: "",
    isSelectLocationPreviousRoute: Ember.computed.localStorage(),
    offerService: Ember.inject.service(),
    fixedDropdownArr: ["frequency", "voltage", "compTestStatus", "testStatus"],
    quantity: 1,
    valueHkDollar: "",
    labels: 1,
    length: null,
    width: null,
    height: null,
    invalidLocation: false,
    invalidScanResult: false,
    newUploadedImage: null,
    subFormData: {},
    successfullyDuplicated: false,
    setDropdownOption: Ember.inject.service(),
    showAdditionalFields: false,
    isAllowedToPublish: false,
    shouldDuplicate: false,
    isSaleable: false,
    imageKeys: Ember.computed.localStorage(),
    i18n: Ember.inject.service(),
    session: Ember.inject.service(),
    locationService: Ember.inject.service(),
    packageService: Ember.inject.service(),
    printerService: Ember.inject.service(),
    selectedDescriptionLanguage: "en",
    cancelWarning: t("items.new.cancel_warning"),
    displayFields: Ember.computed("code", function() {
      let subform = this.get("code.subform");
      return this.returnDisplayFields(subform);
    }),
    offersLists: [],
    hasInvalidDescription: Ember.computed("descriptionEn", function() {
      return !this.get("descriptionEn");
    }),
    isBoxOrPallet: Ember.computed("storageType", function() {
      return ["Box", "Pallet"].indexOf(this.get("storageType")) > -1;
    }),

    pageTitle: Ember.computed("storageType", "parentCodeName", function() {
      return this.get("isBoxOrPallet")
        ? `New ${this.get("storageType")} - ${this.get("parentCodeName")}`
        : `Add - ${this.get("parentCodeName")}`;
    }),

    showPublishItemCheckBox: Ember.computed(
      "quantity",
      "isBoxOrPallet",
      function() {
        this.set("isAllowedToPublish", false);
        return +this.get("quantity") === 1;
      }
    ),
    showDuplicateCheckbox: Ember.computed.equal("storageType", "Package"),

    locale: function(str) {
      return this.get("i18n").t(str);
    },

    allAvailablePrinters: Ember.computed(function() {
      return this.get("printerService").allAvailablePrinters();
    }),

    selectedPrinterDisplay: Ember.computed("selectedPrinterId", function() {
      const printerId = this.get("selectedPrinterId");
      if (printerId) {
        const printer = this.store.peekRecord("printer", printerId);
        return {
          name: printer.get("name"),
          id: printer.id
        };
      } else {
        return this.get("allAvailablePrinters")[0];
      }
    }),

    canApplyDefaultValuation: Ember.computed("valueHkDollar", function() {
      const defaultValue = Number(this.get("defaultValueHkDollar"));
      const valueHkDollar = Number(this.get("valueHkDollar"));
      return defaultValue !== valueHkDollar;
    }),

    setLocation: Ember.observer("scanLocationName", function() {
      var scanInput = this.get("scanLocationName");
      if (scanInput) {
        var results = this.get("store")
          .peekAll("location")
          .filterBy("displayName", scanInput);
        if (results.length > 0) {
          this.set("invalidScanResult", false);
          this.set("location", results.get("firstObject"));
        } else {
          this.set("invalidScanResult", true);
        }
      } else {
        this.set("invalidScanResult", false);
      }
    }),

    validateLocation: Ember.observer("location", function() {
      if (!this.get("location")) {
        this.set("invalidLocation", false);
      }
    }),

    isMobileApp: config.cordova.enabled,
    messageBox: Ember.inject.service(),

    conditions: Ember.computed(function() {
      return this.get("store").peekAll("donor_condition");
    }),

    fetchDetailAttributes() {
      let detailAttributes = {};
      let attributes = {
        ...this.get("inputFieldValues"),
        ...this.get("dropDownValues"),
        ...this.get("countryValue")
      };
      Object.keys(attributes).forEach(key => {
        detailAttributes[_.snakeCase(key)] = attributes[key];
      });
      return detailAttributes;
    },

    clearParams() {
      if (this.get("displayFields")) {
        let attr = this.get("paramsNotCopied");
        attr.forEach(value => this.clearAttribute(value));
      }
    },

    clearAttribute(value) {
      if (value.toLowerCase().includes("country")) {
        return this.setProperties({
          countryValue: {},
          selected: []
        });
      }
      const fieldAtributes = this.get("displayFields").find(
        newValue => newValue.label == value
      );
      if (!fieldAtributes) {
        return;
      }
      return fieldAtributes.autoComplete
        ? this.send("setFields", fieldAtributes.name, null)
        : this.set(`inputFieldValues.${fieldAtributes.value}`, null);
    },

    showPiecesInput: Ember.computed("codeId", "isBoxOrPallet", function() {
      if (this.get("isBoxOrPallet")) {
        return false;
      }

      let codeId = this.get("codeId");
      if (codeId) {
        let selected = this.get("store").peekRecord("code", codeId);
        return selected && selected.get("allow_pieces");
      }
    }),

    emptySubformAttributes: Ember.observer("codeId", function() {
      this.clearSubformAttributes();
    }),

    parentCodeName: Ember.computed("codeId", function() {
      var selected = "";
      var codeId = this.get("codeId");
      if (codeId.length) {
        selected = this.get("store").peekRecord("code", codeId);
        return selected && selected.get("name");
      }
      return selected;
    }),

    code: Ember.computed("codeId", function() {
      var selected = "";
      var codeId = this.get("codeId");
      if (codeId.length) {
        selected = this.get("store").peekRecord("code", codeId);
        return selected && selected.defaultChildPackagesList()[0];
      }
      return selected;
    }),

    isInvalidaLabelCount: Ember.computed("labels", function() {
      const labelCount = this.get("labels");
      return Number(labelCount) < 0;
    }),

    isInvalidPrintCount: Ember.computed("labels", function() {
      return this.isValidLabelRange({
        startRange: 0
      });
    }),

    isMultipleCountPrint: Ember.computed("labels", function() {
      return this.isValidLabelRange({
        startRange: 1
      });
    }),

    isValidDimension: Ember.computed("length", "width", "height", function() {
      const length = parseInt(this.get("length"));
      const width = parseInt(this.get("width"));
      const height = parseInt(this.get("height"));

      // Its a validation error if, any one of them doesn't have a value
      // i.e. either all 3 must have value or none of them have any value
      const dimensionsCount = [length, width, height].filter(
        dimension => !isNaN(dimension) && dimension > 0
      ).length;

      // Its a validation error if, any of the values are 0
      const hasZero = [length, width, height].any(dimension => dimension == 0);

      return (dimensionsCount == 3 || dimensionsCount == 0) && !hasZero;
    }),

    printLabelCount: Ember.computed("labels", function() {
      return Number(this.get("labels"));
    }),

    isInvalidValuation: Ember.computed(
      "valueHkDollar",
      "isBoxOrPallet",
      function() {
        if (this.get("isBoxOrPallet")) {
          return false;
        }

        const value = this.get("valueHkDollar");
        // can be 0
        return value === "" || value === null;
      }
    ),

    location: Ember.computed("codeId", "locationId", {
      get() {
        var location;
        var locationId = this.get("locationId");
        var codeLocation = this.get("code.location");
        if (locationId) {
          this.set("scanLocationName", null);
        }
        if (locationId.length) {
          location = this.get("store").peekRecord("location", locationId);
        } else if (codeLocation) {
          location = codeLocation;
        }
        if (!locationId && location) {
          this.set("locationId", location.get("id"));
        }
        return location;
      },
      set(key, value) {
        return value;
      }
    }),

    initActionSheet: function(onSuccess) {
      return window.plugins.actionsheet.show(
        {
          buttonLabels: [
            this.locale("edit_images.upload").string,
            this.locale("edit_images.camera").string,
            this.locale("edit_images.cancel").string
          ]
        },
        function(buttonIndex) {
          if (buttonIndex === 1) {
            navigator.camera.getPicture(onSuccess, null, {
              quality: 40,
              destinationType: navigator.camera.DestinationType.DATA_URL,
              sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY
            });
          }
          if (buttonIndex === 2) {
            navigator.camera.getPicture(onSuccess, null, {
              correctOrientation: true,
              quality: 40,
              destinationType: navigator.camera.DestinationType.DATA_URL,
              sourceType: navigator.camera.PictureSourceType.CAMERA
            });
          }
          if (buttonIndex === 3) {
            window.plugins.actionsheet.hide();
          }
        }
      );
    },

    packageParams() {
      const locationId = this.get("location.id");
      const quantity = this.get("quantity");
      const detailAttributes = this.fetchDetailAttributes();
      const saleable = this.get("saleableId")
        ? this.get("saleableId").value
        : false;

      return {
        quantity: quantity,
        allow_web_publish: this.get("isAllowedToPublish"),
        length: this.get("length"),
        width: this.get("width"),
        height: this.get("height"),
        weight: this.get("weight"),
        pieces: this.get("pieces"),
        inventory_number: this.get("inventoryNumber"),
        case_number: this.get("caseNumber"),
        notes: this.get("descriptionEn"),
        notes_zh_tw: this.get("descriptionZhTw"),
        detail_type: this.get("code.subform"),
        grade: this.get("selectedGrade.id"),
        donor_condition_id: this.get("defaultCondition.id"),
        location_id: locationId,
        package_type_id: this.get("code.id"),
        state_event: "mark_received",
        storage_type: this.get("storageType"),
        expiry_date: this.get("expiry_date"),
        value_hk_dollar: this.get("valueHkDollar"),
        offer_ids: this.get("offersLists").getEach("id"),
        restriction_id: this.get("restrictionId.id"),
        saleable: saleable,
        comment: this.get("comment"),
        detail_attributes: detailAttributes
      };
    },

    clearSubformAttributes() {
      this.setProperties({
        inputFieldValues: {},
        dropDownValues: {},
        countryValue: {},
        selected: []
      });
    },

    isValidLabelRange({ startRange }) {
      const labelCount = Number(this.get("labels"));
      return _.inRange(labelCount, startRange, 301);
    },

    updateStoreAndSaveImage(data) {
      this.get("store").pushPayload(data);
      var image = this.get("newUploadedImage");
      if (image) {
        image.setProperties({
          imageableId: data.item.id,
          imageableType: "Package"
        });
        image.save();
      }
    },

    hasIncompleteConditions() {
      return (
        this.get("quantity")
          .toString()
          .trim().length === 0 ||
        this.get("descriptionEn").trim().length === 0 ||
        !this.get("location") ||
        this.get("inventoryNumber").trim().length === 0 ||
        !this.get("code") ||
        !this.get("isInvalidPrintCount") ||
        this.get("isInvalidaLabelCount") ||
        !this.get("isValidDimension") ||
        this.get("isInvalidValuation") ||
        this.get("hasInvalidDescription")
      );
    },

    checkPermissionAndScan() {
      let _this = this;
      let permissions = window.cordova.plugins.permissions;
      let permissionError = () => {
        let error_message = _this.get("i18n").t("camera_scan.permission_error");
        _this.get("messageBox").alert(error_message);
      };
      let permissionSuccess = status => {
        //after requesting check for permission then, permit to scan
        if (status.hasPermission) {
          _this.scan();
        } else {
          permissionError();
        }
      };
      permissions.hasPermission(permissions.CAMERA, function(status) {
        //check permission here
        if (status.hasPermission) {
          _this.scan();
        } else {
          //request permission here
          permissions.requestPermission(
            permissions.CAMERA,
            permissionSuccess,
            permissionError
          );
        }
      });
    },

    scan() {
      let onSuccess = res => {
        if (!res.cancelled) {
          var strippedURL = res.text.substring(res.text.lastIndexOf("=") + 1);
          this.set("inventoryNumber", strippedURL);
        }
      };
      let onError = error =>
        this.get("messageBox").alert("Scanning failed: " + error);
      let options = {
        formats: "QR_CODE, CODE_128",
        orientation: "portrait"
      };
      window.cordova.plugins.barcodeScanner.scan(onSuccess, onError, options);
    },

    printBarcode(packageId) {
      const labels = this.get("labels");
      return this.get("packageService")
        .printBarcode({
          package_id: packageId,
          labels,
          tag: "stock"
        })
        .catch(error => {
          this.get("messageBox").alert(error.responseJSON.errors);
        });
    },

    isInValidConditions() {
      const itemConditions = this.hasIncompleteConditions();
      if (itemConditions) {
        if (!this.get("location")) {
          this.set("invalidLocation", true);
        }
        return true;
      } else {
        return false;
      }
    },

    showOfflineError() {
      if (!window.navigator.onLine) {
        this.get("messageBox").alert(this.get("i18n").t("offline_error"));
        return false;
      }
    },

    createPackage() {
      this.set("previousInventoryNumber", this.get("inventoryNumber"));
      this.get("packageService")
        .createPackage({
          package: this.packageParams()
        })
        .then(data => {
          if (this.get("isMultipleCountPrint")) {
            this.printBarcode(data.item.id);
          }
          this.updateStoreAndSaveImage(data);
          if (this.get("shouldDuplicate") && !this.get("isBoxOrPallet")) {
            this.displayDuplicateParams(data);
          } else {
            this.clearAllFields();
            this.replaceRoute("items.detail", data.item.id);
          }
        })
        .catch(response => {
          this.showError(
            response.responseJSON && response.responseJSON.errors[0]
          );
        })
        .finally(() => {
          this.hideLoadingSpinner();
        });
    },

    async displayDuplicateParams(data) {
      this.replaceRoute("items.new");
      this.clearParams();
      Ember.$("body").animate({ scrollTop: 0 });
      this.set("quantity", 1);
      this.set("successfullyDuplicated", true);
      await this.send("autoGenerateInventoryNumber");
      if (this.get("newUploadedImage")) {
        var duplicateImage = this.get("newUploadedImage");
        var newUploadedImage = this.get("store").createRecord("image", {
          cloudinaryId: duplicateImage.get("cloudinaryId"),
          favourite: true
        });
        this.set("newUploadedImage", newUploadedImage);
        this.set("imageKeys", newUploadedImage);
      }
      Ember.run.later(
        this,
        function() {
          this.set("successfullyDuplicated", false);
        },
        4000
      );
    },

    clearAllFields() {
      this.clearSubformAttributes();

      this.setProperties({
        locationId: "",
        comment: "",
        successfullyDuplicated: false,
        inventoryNumber: "",
        offersLists: [],
        descriptionEn: "",
        descriptionZhTw: ""
      });
    },

    actions: {
      async pickLocation() {
        this.set(
          "location",
          await this.get("locationService").userPickLocation()
        );
      },

      setPkgDescriptionLang(language) {
        this.set("selectedDescriptionLanguage", language);
      },

      /**
       *  Add the default suggested description for selected language
       * @param {string} language - Language EN | Zh-TW
       */
      addDefaultDescriptionFor(language) {
        if (language === "en") {
          const description = this.get("code.descriptionEn");
          this.set("descriptionEn", description);
        } else {
          const description = this.get("code.descriptionZhTw");
          this.set("descriptionZhTw", description);
        }
      },

      /**
       * Change the Grade value and update the item valuation
       * @param {Object} selectedGrade - The selected grade value of item
       * @param {string} selectedGrade.id - ID of the grade
       * @param {string} selectedGrade.name - Name of the grade
       */
      onGradeChange({ id, name }) {
        this.set("selectedGrade", { id, name });
        this.set("defaultValueHkDollar", null);
        this.send("calculateItemValuation");
      },

      /**
       * Change the donor condition value and update the item valuation
       * @param {Object} defaultCondition - The selected condition of item
       * @param {string} defaultCondition.id - ID of the condition
       * @param {string} defaultCondition.name - Name of the condition
       */
      onConditionChange({ id, name }) {
        this.set("defaultCondition", { id, name });
        this.set("defaultValueHkDollar", null);
        this.send("calculateItemValuation");
      },

      /**
       * Makes an API call to calculate the item valuation based on
       * donor condition, grade and package type.
       * This also sets the default value for item valuation.
       */
      async calculateItemValuation() {
        const itemValuation = await this.get("packageService").getItemValuation(
          {
            donorConditionId: this.get("defaultCondition.id"),
            grade: this.get("selectedGrade.id"),
            packageTypeId: this.get("code.id")
          }
        );
        const defaultValueHkDollar = this.get("defaultValueHkDollar");
        if (!defaultValueHkDollar) {
          this.set("defaultValueHkDollar", +itemValuation.value_hk_dollar);
        }
        this.set("valueHkDollar", +itemValuation.value_hk_dollar);
      },

      removeOffer(offer) {
        const offersList = this.get("offersLists").filter(
          offer_list => offer_list.id !== offer.id
        );
        this.set("offersLists", offersList);
      },

      async addOffer() {
        const offer = await this.get("offerService").getOffer();
        if (!offer) {
          return;
        }
        const offers = _.uniq([...this.get("offersLists"), offer]);
        this.set("offersLists", offers);
      },

      setDefaultItemValuation() {
        this.set("valueHkDollar", this.get("defaultValueHkDollar"));
      },

      //file upload
      triggerUpload() {
        // For Cordova application
        if (config.cordova.enabled) {
          var onSuccess = (function() {
            return function(path) {
              console.log(path);
              var dataURL = "data:image/jpg;base64," + path;

              Ember.$("input[type='file']").fileupload(
                "option",
                "formData"
              ).file = dataURL;
              Ember.$("input[type='file']").fileupload("add", {
                files: [dataURL]
              });
            };
          })(this);

          this.initActionSheet(onSuccess);
        } else {
          // For web application
          if (navigator.userAgent.match(/iemobile/i)) {
            //don't know why but on windows phone need to click twice in quick succession
            //for dialog to appear
            Ember.$("input[type='file']")
              .click()
              .click();
          } else {
            Ember.$("input[type='file']").trigger("click");
          }
        }
      },

      uploadReady() {
        this.set("isReady", true);
      },

      uploadStart(e, data) {
        this.send("deleteUnusedImage");
        this.set("uploadedFileDate", data);
        Ember.$(".loading-image-indicator").show();
        this.set("loadingPercentage", "Image Uploading ");
      },

      cancelUpload() {
        if (this.get("uploadedFileDate")) {
          this.get("uploadedFileDate").abort();
        }
      },

      uploadProgress(e, data) {
        e.target.disabled = true; // disable image-selection
        var progress = parseInt((data.loaded / data.total) * 100, 10) || 0;
        this.set("addPhotoLabel", progress + "%");
        this.set("loadingPercentage", "Image Uploading " + progress + "%");
      },

      uploadComplete(e) {
        e.target.disabled = false; // enable image-selection
        this.set("uploadedFileDate", null);
        Ember.$(".loading-image-indicator.hide_image_loading").hide();
        this.set("loadingPercentage", "Image Uploading ");
      },

      uploadSuccess(e, data) {
        var identifier =
          data.result.version +
          "/" +
          data.result.public_id +
          "." +
          data.result.format;
        var newUploadedImage = this.get("store").createRecord("image", {
          cloudinaryId: identifier,
          favourite: true
        });
        this.set("newUploadedImage", newUploadedImage);
        this.set("imageKeys", identifier);
      },

      clearDescription() {
        this.set("description", "");
      },

      deleteAutoGeneratedNumber() {
        return this.runTask(() => {
          return this.get("packageService").removeInventoryNumber({
            code: this.get("inventoryNumber")
          });
        });
      },

      deleteUnusedImage() {
        if (this.get("imageKeys.length")) {
          new AjaxPromise(
            "/images/delete_cloudinary_image",
            "PUT",
            this.get("session.authToken"),
            {
              cloudinary_id: this.get("imageKeys")
            }
          );
          this.set("imageKeys", "");
          this.set("newUploadedImage", null);
        }
      },

      cancelForm() {
        const cancel = () => {
          return this.runTask(async () => {
            this.clearAllFields();
            if (this.get("inventoryNumber")) {
              await this.send("deleteAutoGeneratedNumber");
              this.set("inventoryNumber", "");
            }
            this.send("deleteUnusedImage");
            this.setProperties({
              locationId: "",
              comment: "",
              codeId: "",
              successfullyDuplicated: false,
              shouldDuplicate: false
            });
            Ember.run.later(
              this,
              function() {
                this.replaceRoute("/");
              },
              0
            );
          });
        };

        this.get("messageBox").custom(
          this.get("cancelWarning"),
          "Yes",
          cancel,
          "No"
        );
      },

      toggleInventoryOptions() {
        this.toggleProperty("displayInventoryOptions");
      },

      async editInventoryNumber() {
        await this.send("deleteAutoGeneratedNumber");
        this.set("inventoryNumber", "");
        this.set("inputInventory", true);
        this.set("autoGenerateInventory", false);
        this.set("displayInventoryOptions", false);
      },

      autoGenerateInventoryNumber() {
        this.set("inventoryNumber", "");
        this.set("inputInventory", false);
        this.set("autoGenerateInventory", true);
        this.set("displayInventoryOptions", false);

        this.showLoadingSpinner();
        this.get("packageService")
          .generateInventoryNumber()
          .then(data => {
            this.set("inventoryNumber", data.inventory_number);
            this.hideLoadingSpinner();
          });
      },

      scanInventoryNumber() {
        this.set("displayInventoryOptions", false);
        this.set("autoGenerateInventory", false);
        this.set("inputInventory", false);
        this.send("deleteAutoGeneratedNumber");
        this.checkPermissionAndScan();
      },

      onSearch(field, searchText) {
        this.onSearchCountry(field, searchText);
      },

      setCountryValue(value) {
        let CountryName = this.get("store")
          .peekRecord("country", value.id)
          .get("nameEn");
        this.set("selected", {
          id: value.id,
          nameEn: CountryName
        });
        this.set("countryValue", {
          country_id: value.id
        });
      },

      setPrinterValue(value) {
        const printerId = value.id;
        this.set("selectedPrinterId", printerId);
        this.get("printerService").updateUserDefaultPrinter(printerId);
      },

      setFields(fieldName, value) {
        let dropDownValues = { ...this.get("dropDownValues") };
        if (this.get("fixedDropdownArr").indexOf(fieldName) >= 0) {
          dropDownValues[`${fieldName}_id`] = value == null ? "" : value.id;
        } else {
          dropDownValues[fieldName] =
            value !== null && value.tag ? value.tag.trim() : "";
        }
        this.set("dropDownValues", dropDownValues);
      },

      saveItem() {
        this.showOfflineError();
        this.set("isSearchCodePreviousRoute", false);
        if (this.isInValidConditions()) {
          return false;
        } else {
          this.showLoadingSpinner();
          this.createPackage();
        }
      }
    }
  }
);
