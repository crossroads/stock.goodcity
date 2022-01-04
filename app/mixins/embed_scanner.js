import Ember from 'ember';
import AsyncMixin from './async';
import _ from 'lodash';

export default Ember.Mixin.create(AsyncMixin, {
  barcodeService: Ember.inject.service(),

  // ----------------------
  // Scanner
  // ----------------------

  canScan: Ember.computed(function() {
    return this.get('barcodeService').enabled();
  }),

  cannotScan: Ember.computed.not('canScan'),

  /**
   * Counts a package by scanning a barcode
   */
  startScanning() {
    if (this.get('cannotScan') || this.get('isScanning')) {
      return;
    }

    this.set('isScanning', true);

    Ember.run.scheduleOnce('afterRender', this, async () => {
      try {
        const scannerPreviewId = this.get('scannerPreviewId');

        if (!scannerPreviewId) {
          const e = new Error('Implementation of EmberScannerMixin should provide a scannerPreviewId');
          console.error(e);
          throw e;
        }

        const scanner = await this.get('barcodeService').scanMultiple({
          previewElement: document.getElementById(scannerPreviewId),
          onBarcode: (this.onBarcodeScanned || _.noop).bind(this),
          onStop: this.stopScanning.bind(this),
        });

        this.set('scanner', scanner);
      } catch (e) {
        this.modalAlert('stocktakes.scanning_failure');
        this.set('isScanning', false);
      }
    });
  },

  stopScanning() {
    if (!this.get('isScanning')) {
      return;
    }

    this.set('isScanning', false);
    this.get('scanner').stop();
    this.set('scanner', null);
  },

  actions: {
    toggleScanning() {
      if (this.get('isScanning')) {
        this.stopScanning();
      } else {
        this.startScanning();
      }
    },

    stopScanning() {
      this.stopScanning();
    },
  },
});
