import Ember from "ember";
import SearchCode from "../search_code";
import AjaxPromise from "stock/utils/ajax-promise";
const { getOwner } = Ember;

export default SearchCode.extend({
  item: null,
  inlineDescription: true,
  store: Ember.inject.service(),
  messageBox: Ember.inject.service(),

  allPackageTypes: Ember.computed("fetchMoreResult", "item.isSet", function() {
    if (this.get("item.isSet")) {
      return this.get("item.setItem.code").allChildPackagesList();
    } else {
      return this.store.query("code", { stock: true });
    }
  }),

  packageTypeSelectWarning(newPkgType) {
    const item = this.get("item");
    const pkgType = item.get("code");
    const packageName = pkgType.get("name");
    const newPackage = newPkgType.get("name");
    const url = `/packages/${item.get("id")}/remove_details`;
    this.get("messageBox").custom(
      `If you change to ${newPackage} some details related to ${packageName} will no longer be valid. These details will be deleted.`,
      "Not Now",
      null,
      "Continue",
      () => {
        console.log("Continue selected");
        if (this.isSubformPackage(pkgType)) {
          //first delete subform
          new AjaxPromise(url, "PUT", this.get("session.authToken")).then(
            () => {
              // PUT request of new packageType
              this.assignNewType(newPkgType);
            }
          );
        } else {
          //
        }
      }
    );
  },

  isSubformPackage(packageType) {
    return !!packageType.get("subform");
  },

  assignNewType(type) {
    var item = this.get("item");
    var url = `/packages/${item.get("id")}`;
    var key = "package_type_id";
    var packageParams = {};
    packageParams[key] = type.get("id");

    var loadingView = getOwner(this)
      .lookup("component:loading")
      .append();
    new AjaxPromise(url, "PUT", this.get("session.authToken"), {
      package: packageParams
    })
      .then(data => {
        this.get("store").pushPayload(data);
      })
      .finally(() => {
        loadingView.destroy();
      });
    this.transitionToRoute("items.detail", item);
  },

  actions: {
    cancelSearch() {
      Ember.$("#searchText").blur();
      this.send("clearSearch", true);
      this.transitionToRoute("items.detail", this.get("item"));
    },

    assignItemLabel(type) {
      this.isSubformPackage(type);
      this.packageTypeSelectWarning(type);
      // var item = this.get("item");
      // var url = `/packages/${item.get('id')}`;
      // var key = 'package_type_id';
      // var packageParams = {};
      // packageParams[key] = type.get('id');

      // var loadingView = getOwner(this).lookup('component:loading').append();
      // new AjaxPromise(url, "PUT", this.get('session.authToken'), { package: packageParams })
      //   .then(data => {
      //     this.get("store").pushPayload(data);
      //   })
      //   .finally(() => {
      //     loadingView.destroy();
      //   });
      // this.transitionToRoute("items.detail", item);
    }
  }
});
