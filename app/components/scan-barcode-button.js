import Ember from "ember";

export default Ember.Component.extend({
  messageBox: Ember.inject.service(),
  i18n: Ember.inject.service(),
  record: null,

  checkPermissionAndScan(route) {
    let _this = this;
    let permissions = window.cordova.plugins.permissions;
    let permissionError = () => {
      let error_message = _this.get("i18n").t("camera_scan.permission_error");
      _this.get("messageBox").alert(error_message);
    };
    let permissionSuccess = status => {
      //after requesting check for permission then, permit to scan
      if (status.checkPermission) {
        _this.scan(route);
      } else {
        permissionError();
      }
    };
    permissions.checkPermission(permissions.CAMERA, function(status) {
      //check permission here
      if (status.checkPermission) {
        _this.scan(route);
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

  scan(route) {
    var onSuccess = res => {
      if (!res.cancelled) {
        var strippedURL = res.text.substring(res.text.lastIndexOf("=") + 1);
        var queryParams = {
          queryParams: { searchInput: strippedURL.replace(/^\x|X/, "") }
        };
        var record = this.get("record");

        if (record) {
          this.get("router").transitionTo(route, record, queryParams);
        } else {
          this.get("router").transitionTo(route, queryParams);
        }
      }
    };
    var onError = error =>
      this.get("messageBox").alert("Scanning failed: " + error);
    var options = { formats: "QR_CODE, CODE_128", orientation: "portrait" };

    window.cordova.plugins.barcodeScanner.scan(onSuccess, onError, options);
  },

  actions: {
    scanBarcode(route) {
      this.checkPermissionAndScan(route);
    }
  }
});
