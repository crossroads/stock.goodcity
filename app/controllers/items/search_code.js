import Ember from "ember";
import SearchCode from "../search_code";
import capitalize from "lodash/capitalize";

export default SearchCode.extend({
  item: null,
  inlineDescription: true,
  store: Ember.inject.service(),
  messageBox: Ember.inject.service(),
  packageService: Ember.inject.service(),
  i18n: Ember.inject.service(),

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
        if (this.isSubformPackage(packageType)) {
          this.assignNew(packageType);
        } else {
          this.assignNew(packageType, { deleteDetailId: true });
        }
      });
  },

  warnAndAssignNew(pkgType) {
    const existingPkgType = this.get("item.code");
    const packageName = existingPkgType.get("name");
    const newPackageName = pkgType.get("name");
    const translation = this.get("i18n");

    this.get("messageBox").custom(
      translation.t("items.new.subform.delete_subform_waring", {
        newPackageName,
        packageName
      }),
      translation.t("not_now"),
      null,
      translation.t("continue"),
      () => {
        this.deleteAndAssignNew(pkgType);
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

  assignNew(type, { deleteDetailId = false } = {}) {
    const item = this.get("item");
    const url = `/packages/${item.get("id")}`;
    const packageParams = {
      package_type_id: type.get("id")
    };
    if (!this.isSamePackage(type)) {
      packageParams.detail_type = capitalize(type.get("subform"));
    }
    if (deleteDetailId) {
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

  isSamePackage(type) {
    const existingPkgTypeSubform = this.get("item.code.subform");
    return type.get("subform") == existingPkgTypeSubform;
  },

  actions: {
    cancelSearch() {
      Ember.$("#searchText").blur();
      this.send("clearSearch", true);
      this.transitionToRoute("items.detail", this.get("item"));
    },

    assignItemLabel(pkgType) {
      if (this.hasExistingPackageSubform() && !this.isSamePackage(pkgType)) {
        this.warnAndAssignNew(pkgType);
      } else {
        this.assignNew(pkgType);
      }
    }
  }
});
