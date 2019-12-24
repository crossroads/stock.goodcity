import { inject as service } from "@ember/service";
import ApiBaseService from "./api-base-service";

export default ApiBaseService.extend({
  store: service(),

  generateInventoryNumber() {
    return this.POST(`/inventory_numbers`);
  },

  printBarcode(pkgParams) {
    return this.POST(`/packages/print_barcode`, pkgParams);
  },

  removeInventoryNumber(code) {
    return this.PUT(`/inventory_numbers/remove_number`, code);
  },

  createPackage(pkgParams) {
    return this.POST(`/packages`, pkgParams);
  },

  updatePackage(pkgId, pkgParams) {
    return this.PUT(`/packages/${pkgId}`, pkgParams).then(data => {
      this.get("store").pushPayload(data);
    });
  },

  getCloudinaryImage(imageId) {
    return this.get("store")
      .peekAll("image")
      .filterBy("cloudinaryId", imageId)
      .get("firstObject");
  }
});
