import Ember from "ember";
import _ from "lodash";
import config from "../config/environment";

const SCAN_OPTIONS = {
  formats: "QR_CODE,CODE_128",
  orientation: "portrait"
};

export default Ember.Service.extend({
  messageBox: Ember.inject.service(),
  packageService: Ember.inject.service(),
  i18n: Ember.inject.service(),
  isMobileApp: config.cordova.enabled,
  paramName: null,

  getScanner() {
    return _.get(window, "cordova.plugins.barcodeScanner");
  },

  enabled() {
    return !!this.getScanner();
  },

  /**
   * Tries to get permission to use the camera
   *
   * @returns {Promise<boolean>} whether the user has granted permission to scan
   */
  requestPermission() {
    const permissions = _.get(window, "cordova.plugins.permissions");

    if (!this.enabled() || !permissions) {
      return Ember.RSVP.resolve(false);
    }

    const deferred = Ember.RSVP.defer();

    const permissionError = e => {
      deferred.reject(e); // Something went wrong
    };

    const permissionSuccess = ({ hasPermission }) => {
      deferred.resolve(hasPermission); // We got an answer from the user
    };

    permissions.hasPermission(permissions.CAMERA, status => {
      if (status.hasPermission) {
        deferred.resolve(true);
      } else {
        permissions.requestPermission(
          permissions.CAMERA,
          permissionSuccess,
          permissionError
        );
      }
    });

    return deferred.promise;
  },

  /**
   * Tries to scan a bar code and returns the scanned text
   *
   * @returns {Promise<string>}
   */
  async scan() {
    const scanner = this.getScanner();
    const allowed = await this.requestPermission();
    const deferred = Ember.RSVP.defer();

    if (!allowed) return null;

    const onSuccess = res => {
      if (res.cancelled || !res.text) {
        return deferred.resolve(null);
      }

      const scannedText = res.text.substring(res.text.lastIndexOf("=") + 1);
      deferred.resolve(scannedText);
    };

    const onError = e => deferred.reject(e);

    scanner.scan(onSuccess, onError, SCAN_OPTIONS);

    return deferred.promise;
  },

  /**
   * Tries to scan a bar code and returns the package associated with the inventory number scanned
   *
   * @returns {Promise<Package>}
   */
  async scanPackage() {
    const inventoryNumber = await this.scan();

    if (!inventoryNumber) {
      return null;
    }

    return this.get("packageService").findPackageByInventoryNumber(
      inventoryNumber
    );
  }
});
