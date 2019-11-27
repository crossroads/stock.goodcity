import ApiBaseService from "./api-base-service";
import { pluralize } from "ember-inflector";
import snakeCase from "lodash/snakeCase";

export default ApiBaseService.extend({
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
    return this.PUT(`/packages/${pkgId}`, pkgParams);
  },

  deletePackage(detailType, detailId) {
    const apiEndpoint = pluralize(snakeCase(detailType).toLowerCase());
    return this.DELETE(`/${apiEndpoint}/${detailId}`);
  }
});
