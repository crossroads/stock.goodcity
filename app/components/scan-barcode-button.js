import Ember from "ember";
import AsyncMixin from "../mixins/async";
import { singleRunner } from "../utils/async";

export default Ember.Component.extend(AsyncMixin, {
  messageBox: Ember.inject.service(),
  barcodeService: Ember.inject.service(),
  i18n: Ember.inject.service(),
  record: null,

  async checkPermissionAndScan(route) {
    const scanner = this.get("barcodeService");

    try {
      const allowed = await scanner.requestPermission();
      if (!allowed) {
        return;
      }
    } catch (e) {
      return this.modalAlert("camera_scan.permission_error");
    }

    await this.scan(route);
  },

  async scan(route) {
    try {
      const code = await this.get("barcodeService").scanOne();
      const record = this.get("record");

      const queryParams = {
        queryParams: { searchInput: code }
      };

      if (!route) {
        this.get("onScanComplete")(code);
        return;
      }

      if (record) {
        this.get("router").transitionTo(route, record, queryParams);
      } else {
        this.get("router").transitionTo(route, queryParams);
      }
    } catch (e) {
      this.modalAlert("Scanning failed: " + e);
    }
  },

  actions: {
    scanBarcode: singleRunner(function(route) {
      return this.checkPermissionAndScan(route);
    })
  }
});
