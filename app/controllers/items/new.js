import Ember from "ember";
import AjaxPromise from "stock/utils/ajax-promise";
import GoodcityController from "../goodcity_controller";
import config from "../../config/environment";
import _ from "lodash";
const { getOwner } = Ember;

export default GoodcityController.extend({
  queryParams: ["codeId", "locationId", "scanLocationName", "caseNumber"],
  codeId: "",
  locationId: "",
  inventoryNumber: "",
  scanLocationName: "",
  displayInventoryOptions: false,
  autoGenerateInventory: true,
  inputInventory: false,
  locationName: Ember.computed.alias("location.displayName"),
  caseNumber: "",
  isSearchCodePreviousRoute: Ember.computed.localStorage(),
  weight: "",
  isSelectLocationPreviousRoute: Ember.computed.localStorage(),
  quantity: 1,
  labels: 1,
  length: null,
  width: null,
  height: null,
  selectedGrade: {
    name: "B",
    id: "B"
  },
  invalidLocation: false,
  invalidScanResult: false,
  newUploadedImage: null,
  isAllowedToPublish: false,

  imageKeys: Ember.computed.localStorage(),

  // detailParams: function(){
  //   this.get("additionalFields").forEach(field)
  //   {this.get(field.name)};
  // },

  i18n: Ember.inject.service(),

  additionalFields: [
    {
      label: "Brand",
      name: "brand",
      value: "brand",
      type: "text",
      autoComplete: true,
      category: ["computer", "computer_accessory", "electrical"]
    },
    {
      label: "Model",
      name: "model",
      type: "text",
      value: "model",
      autoComplete: true,
      category: ["computer", "computer_accessory", "electrical"]
    },
    {
      label: "Serial Number",
      name: "serial_num",
      type: "text",
      value: "serialNum",
      autoComplete: false,
      category: ["computer", "computer_accessory", "electrical"]
    },
    {
      label: "Country of origin",
      name: "country",
      type: "number",
      value: "country",
      autoComplete: true,
      category: ["computer", "computer_accessory", "electrical"]
    },
    {
      label: "Size",
      name: "size",
      type: "text",
      value: "size",
      autoComplete: true,
      category: ["computer", "computer_accessory"]
    },
    {
      label: "Cpu",
      name: "cpu",
      type: "text",
      value: "cpu",
      autoComplete: true,
      category: ["computer"]
    },
    {
      label: "Ram",
      name: "ram",
      type: "text",
      value: "ram",
      autoComplete: true,
      category: ["computer"]
    },
    {
      label: "HDD",
      name: "hdd",
      type: "text",
      value: "hdd",
      autoComplete: true,
      category: ["computer"]
    },
    {
      label: "Optical",
      name: "optical",
      type: "text",
      value: "optical",
      autoComplete: true,
      category: ["computer"]
    },
    {
      label: "video",
      name: "Video",
      type: "text",
      value: "video",
      autoComplete: true,
      category: ["computer"]
    },
    {
      label: "Sound",
      name: "sound",
      type: "text",
      value: "sound",
      autoComplete: true,
      category: ["computer"]
    },
    {
      label: "Lan",
      name: "lan",
      type: "text",
      value: "lan",
      autoComplete: true,
      category: ["computer"]
    },
    {
      label: "Wireless",
      name: "wireless",
      type: "text",
      value: "wireless",
      autoComplete: true,
      category: ["computer"]
    },
    {
      label: "Usb",
      name: "usb",
      type: "text",
      value: "usb",
      autoComplete: true,
      category: ["computer"]
    },
    {
      label: "Comp Voltage",
      name: "comp_voltage",
      type: "text",
      value: "compVoltage",
      autoComplete: true,
      category: ["computer", "computer_accessory"]
    },
    {
      label: "Test status",
      name: "test_status",
      type: "text",
      autoComplete: true,
      value: "testStatus",
      category: ["computer", "computer_accessory"]
    },
    {
      label: "OS",
      name: "os",
      type: "text",
      value: "os",
      autoComplete: true,
      category: ["computer"]
    },
    {
      label: "OS Serial Num",
      name: "os_serial_num",
      type: "text",
      value: "osSerialNum",
      autoComplete: false,
      category: ["computer"]
    },
    {
      label: "Ms Office Serial Num",
      name: "ms_office_serial_num",
      type: "text",
      value: "msOfficeSerialNum",
      autoComplete: false,
      category: ["computer"]
    },
    {
      label: "Mar  OS serial Num",
      name: "mar_os_serial_num",
      type: "text",
      value: "marOsSerialNum",
      autoComplete: false,
      category: ["computer"]
    },
    {
      label: "Mar Ms Office Serial Num",
      name: "mar_ms_office_serial_num",
      type: "text",
      value: "marMsOfficeSerialNum",
      autoComplete: false,
      category: ["computer"]
    },
    {
      label: "Interface",
      name: "interface",
      type: "text",
      value: "interface",
      autoComplete: true,
      category: ["computer_accessory"]
    },
    {
      label: "Standard",
      name: "standard",
      type: "text",
      value: "standard",
      autoComplete: true,
      category: ["computer_accessory"]
    },
    {
      label: "Voltage",
      name: "voltage",
      type: "number",
      value: "voltage",
      autoComplete: true,
      category: ["electrical"]
    },
    {
      label: "Power",
      name: "power",
      type: "text",
      value: "power",
      autoComplete: true,
      category: ["electrical"]
    },
    {
      label: "System or Region",
      name: "system_or_region",
      type: "text",
      value: "systemOrRegion",
      autoComplete: true,
      category: ["electrical"]
    },
    {
      label: "Test Status",
      name: "test_status",
      type: "text",
      value: "tesetStatus",
      autoComplete: true,
      category: ["electrical"]
    },
    {
      label: "Tested On",
      name: "tested_on",
      type: "text",
      value: "tesetedOn",
      autoComplete: true,
      category: ["electrical"]
    },
    {
      label: "Frequency",
      name: "frequency",
      type: "number",
      value: "frequency",
      autoComplete: true,
      category: ["electrical"]
    }
  ],

  showAdditionalFields: Ember.computed("code", function() {
    return !(
      ["computer", "computer_accessory", "electrical"].indexOf(
        this.get("code.subform")
      ) === -1
    );
  }),

  fetchPackageDetails: Ember.computed("packageDetails", function() {
    if (this.get("showAdditionalFields")) {
      let package_details = this.get("packageDetails");
      if (package_details) {
        let subFormData = {};
        let columns = Object.keys(package_details.get("firstObject").toJSON());
        columns.map(column => {
          let columnData = package_details.getEach(column);
          subFormData[column] = columnData.map((_column, index) => {
            return {
              id: index + 1,
              tag: columnData[index]
            };
          });
        });

        return subFormData;
      }
    }
  }),

  displayFields: Ember.computed("code", function() {
    let _this = this;
    if (this.get("showAdditionalFields")) {
      return this.additionalFields.filter(function(field) {
        return field.category.includes(_this.get("code.subform"));
      });
    }
  }),

  packageService: Ember.inject.service(),

  showPublishItemCheckBox: Ember.computed("quantity", function() {
    this.set("isAllowedToPublish", false);
    return +this.get("quantity") === 1;
  }),

  locale: function(str) {
    return this.get("i18n").t(str);
  },

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
  formElement: {},
  conditions: Ember.computed(function() {
    return this.get("store").peekAll("donor_condition");
  }),

  defaultCondition: Ember.computed(function() {
    const conditions = this.get("conditions");
    return (
      conditions.filterBy("name", "Lightly Used").get("firstObject") ||
      conditions.get("firstObject")
    );
  }),

  grades: Ember.computed(function() {
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

  description: Ember.computed("code", {
    get() {
      return this.get("code.name");
    },
    set(key, value) {
      return value;
    }
  }),

  showPiecesInput: Ember.computed("codeId", function() {
    let codeId = this.get("codeId");
    if (codeId) {
      let selected = this.get("store").peekRecord("code", codeId);
      return selected && selected.get("allow_pieces");
    }
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
    return !labelCount || Number(labelCount) < 0;
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

  isInvalidDimension: Ember.computed("length", "width", "height", function() {
    const length = this.get("length");
    const width = this.get("width");
    const height = this.get("height");
    const dimensionsCount = _.filter(
      [length, width, height],
      item => Number(item) <= 0
    ).length;
    return _.inRange(dimensionsCount, 1, 3);
  }),

  printLabelCount: Ember.computed("labels", function() {
    return Number(this.get("labels"));
  }),

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
      notes: this.get("description"),
      grade: this.get("selectedGrade.id"),
      donor_condition_id: this.get("defaultCondition.id"),
      location_id: locationId,
      package_type_id: this.get("code.id"),
      state_event: "mark_received",
      packages_locations_attributes: {
        0: {
          location_id: locationId,
          quantity: quantity
        }
      }
    };
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
    this.set("locationId", "");
    this.set("inventoryNumber", "");
    this.hideLoadingSpinner();
    this.replaceRoute("items.detail", data.item.id);
  },

  hasIncompleteConditions() {
    return (
      this.get("quantity")
        .toString()
        .trim().length === 0 ||
      this.get("description").trim().length === 0 ||
      !this.get("location") ||
      this.get("inventoryNumber").trim().length === 0 ||
      !this.get("code") ||
      !this.get("isInvalidPrintCount") ||
      this.get("isInvalidaLabelCount") ||
      this.get("isInvalidDimension") ||
      parseInt(this.get("length"), 10) === 0 ||
      parseInt(this.get("width"), 10) === 0 ||
      parseInt(this.get("height"), 10) === 0
    );
  },

  checkPermissionAndScan() {
    let _this = this;
    let permissions = window.cordova.plugins.permissions;
    let permissionError = () => {
      let error_message = this.get("i18n").t("camera_scan.permission_error");
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
    this.get("packageService")
      .printBarcode({
        package_id: packageId,
        labels
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

  actions: {
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
      this.showLoadingSpinner();
      this.get("packageService")
        .removeInventoryNumber({
          code: this.get("inventoryNumber")
        })
        .then(() => this.hideLoadingSpinner());
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
      this.get("messageBox").custom(
        "You will lose all your data. Are you sure you want to cancel this item?",
        "Yes",
        () => {
          if (this.get("inventoryNumber")) {
            this.send("deleteAutoGeneratedNumber");
            this.set("inventoryNumber", "");
          }
          window.localStorage.setItem("isSelectLocationPreviousRoute", false);
          this.send("deleteUnusedImage");
          this.set("locationId", "");
          this.set("codeId", "");
          Ember.run.later(
            this,
            function() {
              this.replaceRoute("/");
            },
            0
          );
        },
        "No"
      );
    },

    toggleInventoryOptions() {
      this.toggleProperty("displayInventoryOptions");
    },

    editInventoryNumber() {
      this.send("deleteAutoGeneratedNumber");
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

    saveItem() {
      debugger;
      if (!window.navigator.onLine) {
        this.get("messageBox").alert(this.get("i18n").t("offline_error"));
        return false;
      }
      window.localStorage.setItem("isSelectLocationPreviousRoute", false);
      this.set("isSearchCodePreviousRoute", false);
      if (this.isInValidConditions()) {
        return false;
      } else {
        this.showLoadingSpinner();
        this.get("packageService")
          .createPackage({
            package: this.packageParams()
          })
          .then(data => {
            if (this.get("isMultipleCountPrint")) {
              this.printBarcode(data.item.id);
            }
            this.updateStoreAndSaveImage(data);
          })
          .catch(response => {
            this.showLoadingSpinner();
            this.get("messageBox").alert(response.responseJSON.errors[0]);
          });
      }
    }
  }
});
