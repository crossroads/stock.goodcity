import Ember from "ember";
import AjaxPromise from "stock/utils/ajax-promise";
const { getOwner } = Ember;

export default Ember.Controller.extend({
  messageBox: Ember.inject.service(),
  i18n: Ember.inject.service(),
  promptUserPopUp: false,
  orderPackage: null,
  total: 0,
  values: 0,
  orderPackagesAndQuantities: null,
  codeAndQuantities: null,
  codes: null,
  partialUndesignateBackLinkpath: Ember.computed.localStorage(),

  init() {
    this.set("promptUserPopUp", false);
  },

  cannotDispatchItems(designation) {
    return (
      designation &&
      (designation.get("isDraft") ||
        designation.get("isSubmitted") ||
        designation.get("isProcessing"))
    );
  },

  actions: {
    getConfirmationPopUp(item) {
      var total = 0;
      var ordersPackages = item.get("orderPackagesMoreThenZeroQty");
      var elementIds = ordersPackages.getEach("id");
      var orderPkgQty = [];
      var oneRecord = {};
      var codeQty = {};
      elementIds.forEach(record => {
        var value = parseInt(Ember.$(`#${record}`)[0].value, 10);
        var orderPackage = this.get("store").peekRecord(
          "orders_package",
          record
        );
        oneRecord["orders_package_id"] = record;
        oneRecord["package_id"] = orderPackage.get("packageId");
        oneRecord["quantity"] = value;
        orderPkgQty.push(oneRecord);
        oneRecord = {};
        codeQty[orderPackage.get("designation.code")] = value;
        total += value;
      });

      this.set("orderPackagesAndQuantities", orderPkgQty);
      this.set("total", total);
      this.set("codeAndQuantities", codeQty);
      this.set("promptUserPopUp", true);
    },

    undesignate_partial_qty(data) {
      var item = data;
      var loadingView = getOwner(this)
        .lookup("component:loading")
        .append();
      var url;

      url = `/items/${data.id}/undesignate_partial_item`;

      new AjaxPromise(url, "PUT", this.get("session.authToken"), {
        package: this.get("orderPackagesAndQuantities")
      })
        .then(data => {
          this.get("store").pushPayload(data);
          loadingView.destroy();
          if (!item.get("orderPackagesMoreThenZeroQty.length")) {
            this.replaceRoute("items.index");
          }
        })
        .finally(() => {
          loadingView.destroy();
        });
    },

    dispatch(item, orderPackage) {
      var _this = this;
      var designation = item.get("designation");
      if (this.cannotDispatchItems(designation)) {
        _this
          .get("messageBox")
          .alert(
            _this.get("i18n").t("order_details.complete_process_warning"),
            () => {
              this.set("hidden", true);
            }
          );
      } else {
        this.transitionToRoute("items.partial_dispatch", item.id, {
          queryParams: { orderPackageId: orderPackage.id }
        });
      }
    }
  }
});
