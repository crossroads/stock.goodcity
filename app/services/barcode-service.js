import Ember from "ember";
import _ from "lodash";
import config from "../config/environment";
import { buildCameraView } from "../utils/barcode-ui";
import { cached } from "../utils/cache";
import { wait, waitForEmber } from "../utils/async";
import { url } from "../utils/helpers";

/**
 * @enum {function}
 * @readonly
 * @memberof Services/Barcode
 * @static
 */
export const BARCODE_PARSERS = {
  /** Will try to extract the inventory number from the string */
  INVENTORY: code => {
    if (code && url.isUrl(code)) {
      return (
        url.readQueryParam(code, "num") || _.last(url.pathname(code).split("/"))
      );
    }
    return code;
  },

  /** Will return the string as-is */
  RAW: code => code
};

/**
 * @typedef {Object} ScanSession
 * @property {function} stop - Stops the scanner
 */

const SCAN_DELAY = 1500;

/**
 * Barcode Service
 *
 * @module Services/Barcode
 * @description Interface to interact with the Scandit barcode plugin
 *
 */
export default Ember.Service.extend({
  messageBox: Ember.inject.service(),
  packageService: Ember.inject.service(),
  i18n: Ember.inject.service(),
  isMobileApp: config.cordova.enabled,
  paramName: null,

  // ----------------------
  // Private helpers
  // ----------------------

  async __activate() {
    // Scandit has issues when turned on and off very fast.
    // We ensure a few seconds pass between each activation

    if (this.__lastActivation) {
      const waitTime = 4000;
      const elapsed = Date.now() - this.__lastActivation;

      if (elapsed < waitTime) {
        await wait(waitTime - elapsed);
      }
    }

    this.__lastActivation = Date.now();
  },

  __getContext: cached(function() {
    var licenseKey =
      window.device.platform == "Android"
        ? config.APP.SCANDIT_LICENSE_KEY_ANDROID
        : config.APP.SCANDIT_LICENSE_KEY_IOS;
    this.context = Scandit.DataCaptureContext.forLicenseKey(licenseKey);
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
   * @param {object} cfg
   * @param {HTMLElement} cfg.previewElement
   * @param {function} cfg.onStop
   * @param {function} cfg.onCapture
   * @returns {Promise<ScanSession>}
   */
  async __newScanSession({ previewElement, onCapture, onStop }) {
    const capture = this.__getCapture();

    const listener = {
      didScan: (barcodeCapture, session) => {
        this.__disableScan();
        onCapture(barcodeCapture, session);
        Ember.run.debounce(this, this.__enableScan, SCAN_DELAY);
      }
    };

    capture.addListener(listener);

    // --- Connect to the UI

    const view = Scandit.DataCaptureView.forContext(this.__getContext());
    const overlay = buildCameraView(previewElement);

    await this.__activate();

    view.connectToElement(overlay.element);

    Scandit.BarcodeCaptureOverlay.withBarcodeCaptureForView(capture, view);

    this.__cameraOn();
    this.__enableScan();

    // --- Create stop callback

    const stop = cached(() => {
      document.removeEventListener("pause", stop);
      this.__cameraOff();
      overlay.destroy();
      capture.removeListener(listener);
      Ember.run.debounce(this, this.__disableScan, SCAN_DELAY + 100);
      this.turnFlashlightOff();
      onStop();
    });

    document.addEventListener("pause", stop);

    overlay.addButton("Stop", () => {
      stop();
      overlay.destroy();
      this.turnFlashlightOff();
    });

    overlay.addButton("Light", () => {
      this.toggleFlashlight();
    });

    return { stop };
  },

  // ----------------------
  // Service API
  // ----------------------

  /**
   * Turns the flashlight on (if available)
   *
   * @returns {Promise<undefined>}
   */
  turnFlashlightOn() {
    if (this.enabled()) {
      this.__getCamera().desiredTorchState = "on";
      this.set("flashlightActive", true);
    }
  },

  /**
   * Turns the flashlight off (if available)
   *
   * @returns {Promise<undefined>}
   */
  turnFlashlightOff() {
    if (this.enabled()) {
      this.__getCamera().desiredTorchState = "off";
      this.set("flashlightActive", false);
    }
  },

  /**
   * Toggles the flashlight status
   *
   * @returns {Promise<undefined>}
   */
  toggleFlashlight() {
    return this.get("flashlightActive")
      ? this.turnFlashlightOff()
      : this.turnFlashlightOn();
  },

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
    const {
      previewElement = null,
      onBarcode = _.noop,
      onStop = _.noop,
      parser = BARCODE_PARSERS.INVENTORY
    } = opts;

    if (!allowed) return null;

    const scanner = await this.__newScanSession({
      previewElement,
      onStop,
      onCapture(barcodeCapture, session) {
        const { newlyRecognizedBarcode } = session;

        if (newlyRecognizedBarcode) {
          const code = parser(newlyRecognizedBarcode.data);
          onBarcode(code);
        }

      }
    });

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
    const scanner = await this.scanMultiple({
      ...opts,
      onBarcode(code) {
        deferred.resolve(code);
        scanner.stop();
      },
      onStop() {
        deferred.resolve("");
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
