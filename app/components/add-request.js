import Ember from "ember";
const { getOwner } = Ember;
import AjaxPromise from "stock/utils/ajax-promise";

export default Ember.Component.extend({
  layoutName: null,
  isGCRequest: null,

  store: Ember.inject.service(),
  goodcityRequest: Ember.inject.service(),
  packageService: Ember.inject.service(),
  messageBox: Ember.inject.service(),
  i18n: Ember.inject.service(),
  request: null,
  num: null,
  order: null,

  packageTypeName: Ember.computed("request", function() {
    return this.get("request.code.name");
  }),

  onInit: Ember.on("init", function() {
    if (this.get("isGCRequest")) {
      this.set("layoutName", "components/appointment-add-request");
    } else {
      this.set("layoutName", "components/order-add-request");
    }
  }),

  actions: {
    deleteRequest(reqId) {
      var i18n = this.get("i18n");
      let orderCode = this.get("order.code");
      this.get("messageBox").custom(
        i18n.t("order.request.remove_req", { orderCode: orderCode }),
        i18n.t("order.request.remove"),
        () => this.send("removeRequest", reqId),
        i18n.t("not_now")
      );
    },

    async removeRequest(reqId) {
      const req = this.get("store").peekRecord("goodcity_request", reqId);
      await this.get("goodcityRequest")
        .deleteRequest(reqId)
        .finally(() => {
          this.get("store").unloadRecord(req);
        });
    },

    async assingPackageType(reqId) {
      const type = await this.get("packageService").getPackageType();
      if (type) {
        const gcRequest = await this.get("goodcityRequest").updateGcRequest(
          reqId,
          {
            package_type_id: type.get("id"),
            quantity: 1,
            order_id: this.get("order.id")
          }
        );
        this.set("request", gcRequest);
      }
    },

    searchPackageType(reqId, orderId) {
      this.get("router").replaceWith("order.search_code", orderId, {
        queryParams: { reqId: reqId }
      });
    },

    //Fix: Too deeply nested component(3 levels) failing randomly(Known issue with Ember)
    //Remove when Ember is upgraded to >= 3.0
    updateErrorMessage() {
      return false;
    }
  }
});
