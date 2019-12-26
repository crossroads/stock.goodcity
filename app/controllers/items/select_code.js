import Ember from "ember";
import SearchCode from "../search_code";
import capitalize from "lodash/capitalize";

export default SearchCode.extend({
  item: null,
  inlineDescription: true,
  store: Ember.inject.service(),
  messageBox: Ember.inject.service(),
  packageService: Ember.inject.service(),
  subformDetailService: Ember.inject.service(),
  intl: Ember.inject.service(),

  allPackageTypes: Ember.computed("fetchMoreResult", "item.isSet", function() {
    if (this.get("item.isSet")) {
      return this.get("item.setItem.code").allChildPackagesList();
    } else {
      return this.store.query("code", { stock: true });
    }
  }),

  async deleteAndAssignNew(packageType) {
    const item = this.get("item");
    const type = item.get("detailType");
    const detailId = item.get("detailId");
    await this.runTask(
      this.get("subformDetailService").deleteDetailType(type, detailId)
    );
    return this.assignNew(packageType, {
      deleteDetailId: !this.isSubformPackage(packageType)
    });
  },

  warnAndAssignNew(pkgType) {
    const existingPkgType = this.get("item.code");
    const packageName = existingPkgType.get("name");
    const newPackageName = pkgType.get("name");
    const intl = this.get("intl");

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
    return (
      ["computer", "computer_accessory", "electrical"].indexOf(
        packageType.get("subform")
      ) >= 0
    );
  },

  hasExistingPackageSubform() {
    const code = this.get("item.code");
    return this.isSubformPackage(code);
  },

  async assignNew(type, { deleteDetailId = false } = {}) {
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
    await this.runTask(
      this.get("packageService").updatePackage(item.id, {
        package: packageParams
      })
    );
    this.transitionToRoute("items.detail", item.id);
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
