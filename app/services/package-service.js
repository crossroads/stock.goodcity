import ApiBaseService from "./api-base-service";
import { toID } from "stock/utils/helpers";

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
    return this.PUT(`/packages/${pkgId}/add_remove_item`, params);
  },

  fetchContainedPackages(boxPalletId) {
    return this.GET(`/packages/${boxPalletId}/contained_packages`);
  },

  fetchAddedQuantity(entityId, pkgID) {
    return this.GET(`/packages/${pkgID}/fetch_added_quantity`, {
      entity_id: entityId
    });
  },

  allChildPackageTypes(item) {
    let all_package_types = this.getAssociatedPkgTypes(
      item,
      "defaultChildPackages"
    ).concat(this.getAssociatedPkgTypes(item, "otherChildPackages"));
    return all_package_types.getEach("id");
  },

  getAssociatedPkgTypes(item, type) {
    let defaultChildPackageTypes = item.get("code").get(type);
    return this._getPackageTypes(defaultChildPackageTypes);
  },

  _getPackageTypes(types) {
    let packageTypeNames = (types || "").split(",");
    let packagesTypes = [];
    const allPackageTypes = this.get("store").peekAll("code");
    packageTypeNames.map(function(type) {
      allPackageTypes.filter(function(pkgType) {
        return pkgType.get("code") === type ? packagesTypes.push(pkgType) : "";
      });
    });
    return packagesTypes;
  },

  /**
   * Performs action on a package from the specified location
   *
   * @param {Package} pkg the package to move
   * @param {object} opts the move properties
   * @param {Location|string} opts.from the source location or its id
   * @param {number} opts.quantity the quantity to move
   * @param {string} opts.comment the comment of package action
   * @returns {Promise<Model>}
   */
  async peformActionOnPackage(pkg, opts = {}) {
    const { from, actionName, quantity, comment } = opts;

    const payload = await this.PUT(
      `/packages/${pkg.get("id")}/actions/${opts.actionName}`,
      {
        quantity,
        from: toID(from),
        description: comment
      }
    );

    this.get("store").pushPayload(payload);

    return this.get("store").peekRecord("item", pkg.get("id"));
  },

  /**
   * Splits a package into 2 separate packages
   *
   * @param {Package} pkg the package to split
   * @param {number} quantity the quantity to split off from the original
   * @returns {Promise<Package>}
   */
  async splitPackage(pkg, quantity) {
    const payload = await this.PUT(`/items/${toID(pkg)}/split_item`, {
      package: { quantity }
    });

    this.get("store").pushPayload(payload);

    return this.get("store").peekRecord("item", toID(pkg));
  }
});
