import Ember from "ember";
import config from "../config/environment";

export default Ember.Component.extend({
  messageBox: Ember.inject.service(),
  i18n: Ember.inject.service(),
  isMobileApp: config.cordova.enabled,
  paramName: null,

  checkPermissionAndScan() {
    let _this = this;
    let permissions = window.cordova.plugins.permissions;
    let permissionError = () => {
      let error_message = _this.get("i18n").t("camera_scan.permission_error");
      _this.get("messageBox").alert(error_message);
    };
    let permissionSuccess = status => {
      //after requesting check for permission then, permit to scan
      if (status.checkPermission) {
        _this.scan();
      } else {
        permissionError();
      }
    };
    permissions.checkPermission(permissions.CAMERA, function(status) {
      //check permission here
      if (status.checkPermission) {
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
    var onSuccess = res => {
      if (!res.cancelled) {
        var key = this.get("paramName") || "searchInput";
        var queryParams = {};
        var strippedURL = res.text.substring(res.text.lastIndexOf("=") + 1);
        queryParams[key] = strippedURL;
        this.get("router").transitionTo(this.get("route"), {
          queryParams: queryParams
        });
      }
    };

    var onError = error =>
      this.get("messageBox").alert("Scanning failed: " + error);
    var options = { formats: "QR_CODE ,CODE_128", orientation: "portrait" };

    window.cordova.plugins.barcodeScanner.scan(onSuccess, onError, options);
  },

  actions: {
    scanBarcode() {
      this.checkPermissionAndScan();
    }
  }
});
