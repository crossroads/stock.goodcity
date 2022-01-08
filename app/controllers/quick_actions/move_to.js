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
    if (text) {
      // We clear it after a few seconds
      Ember.run.debounce(this, this.showScannerError, '', 3000);
    }
  },

  async triggerMove(pkg) {
    if (this.get('moveInProgress')) {
      return;
    }

    let sourceLocation = null;

    const locations = pkg.get('locations');

    if (locations.get('length') === 1 && locations.get('firstObject.id') === this.get('destination.id')) {
      // There is only one location, and it is the destination
      return this.showScannerError(this.get('i18n').t('quick_action_errors.all_packages_at_destination'));
    }

    const validSources = locations.filter(loc => loc.get('id') !== this.get('destination.id'));

    if (validSources.get('length') === 0) {
      // There's none of this package anywhere
      return this.showScannerError(this.get('i18n').t('quick_action_errors.no_package_for_move'));
    }

    if (validSources.get('length') === 1) {
      // There is only one location, we pick it without prompting the user
      sourceLocation = validSources.get('firstObject');
    }

    const restoreScanner = sourceLocation === null && this.get('isScanning');

    if (restoreScanner) {
      this.stopScanning();
    }

    this.send('beginMove', pkg, sourceLocation, this.get('destination'), () => {
      if (restoreScanner) {
        this.startScanning();
      }
    });
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

  onBadInventoryNumber(num) {
    this.showScannerError(
      this.get('i18n').t('stocktakes.unknown_inventory_number', {
        code: num,
      })
    );
  },

  async onBarcodeScanned(inventoryNumber) {
    if (!inventoryNumber || this.get('moveInProgress')) return;

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
    async pickPackage() {
      if (this.get('moveInProgress')) return;

      this.stopScanning();

      const pkg = await this.get('packageService').userPickPackage();

      if (!pkg) return;

      this.triggerMove(pkg);
    },
  },
});
