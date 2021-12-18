import EmbedScannerMixin from 'stock/mixins/embed_scanner';
import MoveActions from 'stock/mixins/move_actions';
import AsyncMixin from 'stock/mixins/async';
import Ember from 'ember';
import _ from 'lodash';

/**
 * @module Controllers/quick_actions/StockActionsController
 * @augments ember/Controller
 */
export default Ember.Controller.extend(AsyncMixin, EmbedScannerMixin, MoveActions, {
  // ----------------------
  // Dependencies
  // ----------------------

  store: Ember.inject.service(),
  i18n: Ember.inject.service(),
  barcodeService: Ember.inject.service(),
  packageService: Ember.inject.service(),

  // ----------------------
  // Properties
  // ----------------------

  moveInProgress: Ember.computed.alias('readyToMove'),

  // ----------------------
  // Methods
  // ----------------------

  showScannerError(text) {
    this.set('scannerError', text);
  },

  async triggerMove(pkg) {
    if (this.get('moveInProgress')) {
      return;
    }

    this.send('beginMove', pkg, null, this.get('destination'));
  },

  // ----------------------
  // Lifecycle
  // ----------------------

  on() {
    this.set('scannerPreviewId', `stocktake-scanner-preview-${_.uniqueId()}`);
  },

  off() {
    this.set('active', false);
    this.stopScanning();
  },

  async onBeginMove() {
    if (this.get('isScanning')) {
      this.stopScanning();
      await new Promise(d => setTimeout(d, 1000));
    }
  },

  onBadInventoryNumber(num) {
    this.showScannerError(
      this.get('i18n').t('stocktakes.unknown_inventory_number', {
        code: num,
      })
    );
    Ember.run.debounce(this, this.showScannerError, '', 3000);
  },

  async onBarcodeScanned(inventoryNumber) {
    if (!inventoryNumber) return;

    const pkg = await this.get('packageService').findPackageByInventoryNumber(inventoryNumber);

    if (!pkg) {
      return this.onBadInventoryNumber(inventoryNumber);
    }

    return this.triggerMove(pkg);
  },

  // ----------------------
  // Actions
  // ----------------------

  actions: {
    async addItem(pkg, opts = {}) {
      if (this.get('moveInProgress')) return;

      pkg =
        pkg ||
        (await this.get('packageService').userPickPackage({
          searchMode: 'numeric',
        }));

      if (!pkg) return;

      this.triggerMove(pkg);
    },
  },
});
