import ApiBaseService from "./api-base-service";

export default ApiBaseService.extend({
  store: Ember.inject.service(),

  init() {
    this._super(...arguments);
    this.set("openPackageSearch", false);
    this.set("openItemSearch", false);
    this.set("entity", null);
  },

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
  },

  createInventory(storageType) {
    Ember.run(() => {
      this.set("openPackageSearch", true);
      this.set("storageType", storageType);
    });
  },

  openItemsSearch(item) {
    Ember.run(() => {
      this.set("openItemSearch", true);
      this.set("entity", item);
    });
  },

  addRemoveItem(pkgId, params) {
    this.PUT(`/packages/${pkgId}/perform_action`, params).then(data => {
      this.get("store").pushPayload(data);
    });
  }
});
