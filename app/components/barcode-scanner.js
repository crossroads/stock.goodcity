import Ember from "ember";
import AsyncMixin from "../mixins/async";

export default Ember.Component.extend(AsyncMixin, {
  barcodeService: Ember.inject.service(),
  paramName: null,

  redirect(scannedText) {
    if (scannedText) {
      const key = this.get("paramName") || "searchInput";
      this.get("router").transitionTo(this.get("route"), {
        queryParams: {
          [key]: scannedText
        }
      });
    }
  },

  actions: {
    async scanBarcode() {
      const scanner = this.get("barcodeService");

      try {
        const allowed = await scanner.requestPermission();
        if (!allowed) {
          return;
        }
      } catch (e) {
        return this.modalAlert("camera_scan.permission_error");
      }

      try {
        this.redirect(await scanner.scan());
      } catch (e) {
        this.modalAlert("Scanning failed: " + error);
      }
    }
  }
});
