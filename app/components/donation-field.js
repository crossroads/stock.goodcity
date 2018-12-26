import Ember from "ember";
import barcodeScaner from './barcode-scanner';

export default barcodeScaner.extend({
  messageBox: Ember.inject.service(),
  i18n: Ember.inject.service(),

  checkPermissionAndScan() {
    let _this = this;
    let permissions = window.cordova.plugins.permissions;
    let permissionError = () => {
      let error_message = _this.get("i18n").t("camera_scan.permission_error");
      _this.get("messageBox").alert(error_message);
    };
    let permissionSuccess = (status) => {
      //after requesting check for permission then, permit to scan
      if( status.hasPermission ) {
        _this.scan();
      } else {
        permissionError();
      }
    };
    permissions.hasPermission(permissions.CAMERA, function( status ){
      //check permission here
      if ( status.hasPermission ) {
        _this.scan();
      }
      else {
        //request permission here
        permissions.requestPermission(permissions.CAMERA, permissionSuccess, permissionError);
      }
    });
  },

  scan() {
    var item = this.get('item');
    var onSuccess = res => {
      if (!res.cancelled) {
        item.set('caseNumber', res.text);
      }
    };

    var onError = error => this.get("messageBox").alert("Scanning failed: " + error);
    var options = {"formats": "QR_CODE, CODE_128", "orientation" : "portrait" };

    window.cordova.plugins.barcodeScanner.scan(onSuccess, onError, options);
  },

  actions: {
    scanBarcode(){
      this.checkPermissionAndScan();
    }
  }
});
