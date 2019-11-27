import Ember from "ember";
import SearchCode from "../search_code";
import capitalize from "lodash/capitalize";

export default SearchCode.extend({
  item: null,
  inlineDescription: true,
  store: Ember.inject.service(),
  messageBox: Ember.inject.service(),
  packageService: Ember.inject.service(),

  allPackageTypes: Ember.computed("fetchMoreResult", "item.isSet", function() {
    if (this.get("item.isSet")) {
      return this.get("item.setItem.code").allChildPackagesList();
    } else {
      return this.store.query("code", { stock: true });
    }
  }),

  deleteAndAssignNew(packageType) {
    const item = this.get("item");
    const detailType = item.get("detailType");
    const detailId = item.get("detail.id");
    this.showLoadingSpinner();
    this.get("packageService")
      .deletePackage(detailType, detailId)
      .then(() => {
        this.assignNew(packageType);
      });
  },

  warnAndAssignNew(pkgType) {
    const existingPkgType = this.get("item.code");
    const packageName = existingPkgType.get("name");
    const newPackageName = pkgType.get("name");

    this.get("messageBox").custom(
      `If you change to ${newPackageName} some details related to ${packageName} will no longer be valid. These details will be deleted.`,
      "Not Now",
      null,
      "Continue",
      () => {
        if (this.isSubformPackage(pkgType)) {
          this.deleteAndAssignNew(pkgType);
        } else {
          this.assignNew(pkgType, { delete_detail_id: true });
        }
      }
    );
  },

  isSubformPackage(packageType) {
    return !!packageType.get("subform");
  },

  hasExistingPackageSubform() {
    const code = this.get("item.code");
    return this.isSubformPackage(code);
  },

  assignNew(type, { delete_detail_id = false } = {}) {
    const item = this.get("item");
    const url = `/packages/${item.get("id")}`;
    const packageParams = {
      package_type_id: type.get("id"),
      detail_type: capitalize(type.get("subform"))
    };
    if (delete_detail_id) {
      packageParams.detail_id = null;
    }
    this.showLoadingSpinner();
    this.get("packageService")
      .updatePackage(item.id, {
        package: packageParams
      })
      .then(data => {
        this.get("store").pushPayload(data);
        this.transitionToRoute("items.detail", item.id);
      })
      .finally(() => {
        this.hideLoadingSpinner();
      });
  },

  actions: {
    cancelSearch() {
      Ember.$("#searchText").blur();
      this.send("clearSearch", true);
      this.transitionToRoute("items.detail", this.get("item"));
    },

    assignItemLabel(pkgType) {
      if (this.hasExistingPackageSubform()) {
        this.warnAndAssignNew(pkgType);
      } else {
        this.assignNew(pkgType);
      }
    }
  }
});
