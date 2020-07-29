import Ember from "ember";
import _ from "lodash";
import config from "../config/environment";
import { buildCameraView } from "../utils/barcode-ui";

const SCAN_DELAY = 1500;
const LICENSE_KEY =
  "ARBushhVB+A7HWv5WD/nPoFEoQ9BH5EHPkfSQFJYz4JbShzStUOfkWtxoLFTTNQ6izbPWRogpWLQd/w1tEGMmpZTsKFBX3KbW0sqVctVVj54TJ8OEHvXqvZWpIVaW6TZSD44zSBCoLNdOFwaVjFmVbYxc8dGO4WNzQ5oa+hYopIK+X0G3nWxwn1w2F2jasUZ20elxWyJWZ7XDlefc7gUiCfKSgxFpbzVhJkWoAZn1rL8YC1wbn5anSjVA/fF5mQvKWvqGpaLBq0OKxP3aEsvr7ionTuTctWczmr7/cGwloCXvF9DFk3bCtnjr5Z34ff955dkA6TIBtelVwKBZeve9r7qSK1OT+xSI8zCrS0yVAzuxcmP9kJU3zMJdmxJeA9Kinzi1urVXHixBP/1BtX/wtxwuK0h5BfKjfFrIDUMFi2uokh6x4jd1yYyvUCaF5/bnrocihozwaAn86wdtY7QJZ4iK8XqN/a8jlT1C2NbENPMCR/JQoLuz/o+7yuNjpIY51OqPz/vIkXuE20V4GalmbLgjAhUtiUST6XfPYLSm5eZLOzi+sOimBySanbYKC3zEdQU0hoZPt3L+nV5NbtRyY1ZrSvxR9i/kFxbK7IUa0ESzHZNGG5xibOX0h87djTLXNlnAY7r89h2z34b/liT+RKRfxgt2OX7btcB2oMSAcoF8/s6w+XkpiHSpNi+c2WhRB5TqgfM/ZnfDvIb/ugmWpja8fgp2GOVYtv6zNvrreiOqMY+eLjk8YFy8N/k0GcR5eiBnAYRqoCbVHLhjBlj+dKY1MRRD1jGVjEYQGSuOiVyk5CSTNw0NFRee6bVk3M=";

export default Ember.Service.extend({
  messageBox: Ember.inject.service(),
  packageService: Ember.inject.service(),
  i18n: Ember.inject.service(),
  isMobileApp: config.cordova.enabled,
  paramName: null,

  enabled() {
    return this.get("isMobileApp") && !!window.Scandit;
  },

  createCapture(htmlElement, callback) {
    const context = Scandit.DataCaptureContext.forLicenseKey(LICENSE_KEY);

    // --- Setup camera

    const cameraSettings = Scandit.BarcodeCapture.recommendedCameraSettings;
    const camera = Scandit.Camera.default;

    if (!camera) {
      return;
    }

    camera.applySettings(cameraSettings);
    context.setFrameSource(camera);

    // --- Set barcode types

    const settings = new Scandit.BarcodeCaptureSettings();
    settings.enableSymbology(Scandit.Symbology.Code128);
    settings.enableSymbology(Scandit.Symbology.QR);

    // --- Create the capture

    const capture = Scandit.BarcodeCapture.forContext(context, settings);

    const enableScan = () => {
      capture.isEnabled = true;
    };
    const disableScan = () => {
      capture.isEnabled = false;
    };

    const listener = {
      didScan: (barcodeCapture, session) => {
        disableScan();
        callback(barcodeCapture, session);
        Ember.run.debounce(enableScan, SCAN_DELAY);
      }
    };

    capture.addListener(listener);

    // --- Connect to the UI

    const view = Scandit.DataCaptureView.forContext(context);
    const overlay = buildCameraView(htmlElement);

    view.connectToElement(overlay.element);

    const captureOverlay = Scandit.BarcodeCaptureOverlay.withBarcodeCaptureForView(
      capture,
      view
    );

    camera.switchToDesiredState(Scandit.FrameSourceState.On);

    enableScan();

    // --- Create stop callback

    const stop = () => {
      overlay.destroy();
      capture.removeListener(listener);
      camera.switchToDesiredState(Scandit.FrameSourceState.Off);
      Ember.run.debounce(disableScan, SCAN_DELAY + 100);
    };

    overlay.onCloseButtonPressed(stop);

    return { stop };
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
  async scanMultiple(opts = {}) {
    const allowed = this.enabled() && (await this.requestPermission());
    const { previewElement = null, onBarcode = _.noop } = opts;

    if (!allowed) return null;

    const capture = this.createCapture(
      previewElement,
      (barcodeCapture, session) => {
        const { newlyRecognizedBarcodes } = session;

        _.flatten([newlyRecognizedBarcodes])
          .map(bc => bc.data)
          .forEach(onBarcode);
      }
    );

    return capture;
  },

  /**
   *
   *
   * @param {object} [opts={}]
   * @param {HTMLElement} [opts.htmlElement]
   */
  async scanOne(opts = {}) {
    const deferred = Ember.RSVP.defer();
    const { previewElement = null } = opts;

    const capture = await this.scanMultiple({
      previewElement,
      onBarcode(code) {
        deferred.resolve(code);
        capture.stop();
      }
    });

    return deferred.promise;
  },

  // /**
  //  * Tries to scan a bar code and returns the scanned text
  //  *
  //  * @returns {Promise<string>}
  //  */
  // async scan() {
  //   const scanner = this.getScanner();
  //   const allowed = await this.requestPermission();
  //   const deferred = Ember.RSVP.defer();

  //   if (!allowed) return null;

  //   const onSuccess = res => {
  //     if (res.cancelled || !res.text) {
  //       return deferred.resolve(null);
  //     }

  //     const scannedText = res.text.substring(res.text.lastIndexOf("=") + 1);
  //     deferred.resolve(scannedText);
  //   };

  //   const onError = e => deferred.reject(e);

  //   scanner.scan(onSuccess, onError, SCAN_OPTIONS);

  //   return deferred.promise;
  // },

  /**
   * Tries to scan a bar code and returns the package associated with the inventory number scanned
   *
   * @returns {Promise<Package>}
   */
  async scanPackage(opts = {}) {
    const { previewElement = null } = opts;
    const inventoryNumber = await this.scanOne({ previewElement });

    if (!inventoryNumber) {
      return null;
    }

    return this.get("packageService").findPackageByInventoryNumber(
      inventoryNumber
    );
  }
});
