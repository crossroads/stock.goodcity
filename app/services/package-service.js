import _ from "lodash";
import ApiBaseService from "./api-base-service";
import { toID } from "stock/utils/helpers";
import NavigationAwareness from "stock/mixins/navigation_aware";
import ItemActionMixin from "stock/mixins/item_actions";

export default ApiBaseService.extend(NavigationAwareness, ItemActionMixin, {
  store: Ember.inject.service(),
  i18n: Ember.inject.service(),
  packageTypeService: Ember.inject.service(),
  locationService: Ember.inject.service(),

  init() {
    this._super(...arguments);
    this.set("openPackageSearch", false);
    this.set("packageSearchOptions", {});
    this.set("openRemoveItemOverlay", false);
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

  async findPackageByInventoryNumber(inventoryNum) {
    const payload = await this.GET(`/packages`, {
      inventory_number: inventoryNum
    });

    this.get("store").pushPayload(payload);

    return this.get("store")
      .peekAll("item")
      .findBy("inventoryNumber", inventoryNum);
  },

  loadSubform(detailType, detailId) {
    return this.get("store").findRecord(
      _.snakeCase(detailType).toLowerCase(),
      detailId
    );
  },

  async getPackageVersions(pkg) {
    const store = this.get("store");
    const id = toID(pkg);
    const data = await this.GET(`/packages/${id}/versions`);
    store.pushPayload(data);
    return _.get(data, "versions", []).map(it =>
      store.peekRecord("version", it.id)
    );
  },

  async updatePackage(pkg, pkgParams, opts = {}) {
    const { reloadDeps = false } = opts;
    const pkgId = toID(pkg);

    const payload = await this.PUT(`/packages/${pkgId}`, pkgParams);

    if (reloadDeps) {
      const { detail_type, detail_id } = _.get(payload, "item", {});

      if (detail_id && detail_type) {
        await this.loadSubform(detail_type, detail_id);
      }
    }

    this.get("store").pushPayload(payload);
    return this.get("store").peekRecord("item", pkgId);
  },

  getCloudinaryImage(imageId) {
    return this.get("store")
      .peekAll("image")
      .filterBy("cloudinaryId", imageId)
      .get("firstObject");
  },

  getItemValuation({
    donorConditionId: donor_condition_id,
    packageTypeId: package_type_id,
    grade
  }) {
    return this.GET(`/packages/package_valuation`, {
      donor_condition_id,
      package_type_id,
      grade
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

  async fetchContainedPackages(boxPalletId, opts) {
    const pagination = _.pick(opts, ["page", "per_page"]);
    const data = await this.GET(
      `/packages/${boxPalletId}/contained_packages`,
      pagination
    );
    this.get("store").pushPayload(data);
    return Promise.all(
      data.items.map(async item => {
        const quantity = await this.fetchAddedQuantity(boxPalletId, item.id);
        return {
          ...item,
          addedQuantity: quantity.added_quantity,
          isDeleted: false
        };
      })
    );
  },

  async fetchParentContainers(pkg, opts = {}) {
    const store = this.get("store");
    const pagination = _.pick(opts, ["page", "per_page"]);

    const data = await this.GET(
      `/packages/${toID(pkg)}/parent_containers`,
      pagination
    );

    store.pushPayload(data);

    return _.get(data, "items", []).map(it => store.peekRecord("item", it.id));
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
   * Removes a package from its set
   *
   * @param {Package} pkg the package to unlink
   * @returns {Promise<Model>}
   */
  async removeFromSet(pkg) {
    if (!pkg.get("packageSetId")) {
      return pkg;
    }

    const id = pkg.get("id");
    const packageSet = pkg.get("packageSet");

    await this.updatePackage(id, { package: { package_set_id: null } });

    packageSet.get("packageIds").removeObject(Number(id));

    if (packageSet.get("packageIds.length") === 1) {
      const lastPkg = packageSet.get("items.firstObject");
      lastPkg.set("packageSet", null);
      lastPkg.set("packageSetId", null);
      packageSet.set("packageIds", []);
    }

    return this.get("store").peekRecord("item", id);
  },

  /**
   * Creates a set for the package if non-existent
   *
   * @param {Package} pkg the package to add to set
   * @param {PackageType} [pkgType] the package type of the set. If not provided, will request for it
   * @returns {Promise<PackageSet>} the existing newly created package set
   */
  async initializeSetOf(pkg, pkgType) {
    if (pkg.get("packageSet")) {
      return pkg.get("packageSet");
    }

    if (pkg.get("isBoxPallet")) {
      throw new Error(this.get("i18n").t("items.no_box_in_set"));
    }

    const code =
      pkgType ||
      (await this.get("packageTypeService").userPickPackageType({
        storageType: "Package",
        headerText: this.get("i18n").t("items.select_set_type"),
        subsetPackageTypes: this.get("packageTypeService").parentsOf(
          pkg.get("code")
        )
      }));

    const payload = await this.POST(`/package_sets`, {
      package_set: {
        package_type_id: code.get("id"),
        description: code.get("name")
      }
    });

    const setId = _.get(payload, "package_set.id");

    this.get("store").pushPayload(payload);

    await this.updatePackage(pkg, { package: { package_set_id: setId } });

    return this.get("store").peekRecord("package_set", setId);
  },

  /**
   * Adds a package to a set
   *
   * @param {Package} pkg the package to add to set
   * @param {PackageSet} packageSet the package set to add to
   * @returns {Promise<Model>}
   */
  async addToSet(pkg, packageSet) {
    if (pkg.get("packageSetId")) {
      throw new Error(this.get("i18n").t("item.already_in_set"));
    }
    const id = pkg.get("id");
    const payload = await this.PUT(`/packages/${id}`, {
      package: {
        package_set_id: packageSet.get("id")
      }
    });
    this.get("store").pushPayload(payload);
    return this.get("store").peekRecord("item", id);
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
  },

  /**
   * Triggers the package selection popup, and resolves the promise
   * once a package has been selected.
   *
   * null is returned if the user closes the UI
   *
   * @param {object} opts search options
   * @returns {Promise<Model>}
   */
  userPickPackage(opts = {}) {
    const deferred = Ember.RSVP.defer();

    Ember.run(() => {
      this.set("packageSearchOptions", opts);
      this.set("openPackageSearch", true);
      this.set("onPackageSelected", pkg => {
        this.set("onPackageSelected", _.noop);
        this.set("openPackageSearch", false);
        deferred.resolve(pkg || null);
      });
    });

    return deferred.promise;
  },

  async beginUnpack(entity, pkg, quantity) {
    this.set("openRemoveItemOverlay", false);

    const selectedLocation = await this.get(
      "locationService"
    ).userPickLocation();

    if (!selectedLocation) {
      return;
    } else {
      this.set("removableItem", pkg);
      this.set("removableQuantity", quantity);
      this.set("maxRemovableQuantity", quantity);

      this.set("containerEntity", entity);
      this.set("selectedLocation", selectedLocation);
      this.set("openRemoveItemOverlay", true);
    }
  },

  async performUnpack(entity, pkg, quantity, location) {
    let callback = () => {
      this.set("openRemoveItemOverlay", false);
    };

    await this._unpack(entity, pkg, location.id, quantity, callback);
  }
});
