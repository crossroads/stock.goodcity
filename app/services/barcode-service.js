import Ember from "ember";
import _ from "lodash";
import config from "../config/environment";
import { buildCameraView } from "../utils/barcode-ui";
import { cached } from "../utils/cache";

/**
 * @typedef {Object} ScanSession
 * @property {function} stop - Stops the scanner
 */

const SCAN_DELAY = 1500;
const LICENSE_KEY = config.APP.SCANDIT_LICENSE_KEY;
export default Ember.Service.extend({
  messageBox: Ember.inject.service(),
  packageService: Ember.inject.service(),
  i18n: Ember.inject.service(),
  isMobileApp: config.cordova.enabled,
  paramName: null,

  // ----------------------
  // Private helpers
  // ----------------------

  __getContext: cached(function() {
    this.context = Scandit.DataCaptureContext.forLicenseKey(LICENSE_KEY);
    this.context.setFrameSource(this.__getCamera());
    return this.context;
  }),

  __getCamera: cached(function() {
    const cameraSettings = Scandit.BarcodeCapture.recommendedCameraSettings;
    const camera = Scandit.Camera.default;

    if (camera) {
      camera.applySettings(cameraSettings);
    }

    return camera;
  }),

  __getCapture: cached(function() {
    const context = this.__getContext();
    const settings = new Scandit.BarcodeCaptureSettings();

    settings.enableSymbologies([
      /* Scandit.Symbology.Code128, */
      Scandit.Symbology.QR
    ]);

    return Scandit.BarcodeCapture.forContext(context, settings);
  }),

  __cameraOn() {
    this.__getCamera().switchToDesiredState(Scandit.FrameSourceState.On);
  },

  __cameraOff() {
    this.__getCamera().switchToDesiredState(Scandit.FrameSourceState.Off);
  },

  __enableScan() {
    this.__getCapture().isEnabled = true;
  },

  __disableScan() {
    this.__getCapture().isEnabled = false;
  },

  /**
   * Starts a scan session
   *
   * @param {HTMLElement} htmlElement
   * @param {function} callback
   * @returns {ScanSession}
   */
  __newScanSession(htmlElement, callback) {
    const capture = this.__getCapture();

    const listener = {
      didScan: (barcodeCapture, session) => {
        this.__disableScan();
        callback(barcodeCapture, session);
        Ember.run.debounce(this, this.__enableScan, SCAN_DELAY);
      }
    };

    capture.addListener(listener);

    // --- Connect to the UI

    const view = Scandit.DataCaptureView.forContext(this.__getContext());
    const overlay = buildCameraView(htmlElement);

    view.connectToElement(overlay.element);

    const captureOverlay = Scandit.BarcodeCaptureOverlay.withBarcodeCaptureForView(
      capture,
      view
    );

    this.__cameraOn();
    this.__enableScan();

    // --- Create stop callback

    const stop = () => {
      this.__cameraOff();
      overlay.destroy();
      capture.removeListener(listener);
      Ember.run.debounce(this, this.__disableScan, SCAN_DELAY + 100);
    };

    overlay.onCloseButtonPressed(stop);

    return { stop };
  },

  // ----------------------
  // Service API
  // ----------------------

  /**
   * Returns true if scanning is possible
   *
   * @returns {boolean}
   */
  enabled() {
    return this.get("isMobileApp") && !!window.Scandit && this.__getCamera();
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
   * @returns {Promise<ScanSession|null>}
   */
  async scanMultiple(opts = {}) {
    const allowed = this.enabled() && (await this.requestPermission());
    const { previewElement = null, onBarcode = _.noop } = opts;

    if (!allowed) return null;

    const scanner = this.__newScanSession(
      previewElement,
      (barcodeCapture, session) => {
        const { newlyRecognizedBarcodes } = session;

        _.flatten([newlyRecognizedBarcodes])
          .map(bc => bc.data)
          .forEach(onBarcode);
      }
    );

    return scanner;
  },

  /**
   * Returns a promise that resolves once one code has been read
   *
   * @param {object} [opts={}]
   * @param {HTMLElement} [opts.htmlElement]
   * @returns {Promise<string|null>}
   */
  async scanOne(opts = {}) {
    const deferred = Ember.RSVP.defer();
    const { previewElement = null } = opts;

    const scanner = await this.scanMultiple({
      previewElement,
      onBarcode(code) {
        deferred.resolve(code);
        scanner.stop();
      }
    });

    if (!scanner) deferred.resolve(null);

    return deferred.promise;
  },

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
