import Ember from "ember";
import AsyncMixin from "stock/mixins/async";

export default Ember.Component.extend(AsyncMixin, {
  layoutName: null,
  isGCRequest: null,

  store: Ember.inject.service(),
  goodcityRequestService: Ember.inject.service(),
  packageTypeService: Ember.inject.service(),
  packageService: Ember.inject.service(),
  messageBox: Ember.inject.service(),
  i18n: Ember.inject.service(),
  request: null,
  requestType: Ember.computed.alias("request.code"),
  num: null,
  order: null,

  packageTypeName: Ember.computed("request.code", function() {
    return this.get("requestType")
      ? `${this.get("requestType.code")}-${this.get("requestType.name")}`
      : "";
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

    async removeRequest(id, index) {
      if (id) {
        const req = this.get("store").peekRecord("goodcity_request", id);
        await this.runTask(
          this.get("goodcityRequestService").deleteRequest(id)
        );
        this.get("store").unloadRecord(req);
      }
      this.get("onRemoveRequest")(id, index);
    },

    async assingPackageType() {
      const packageType = await this.get(
        "packageTypeService"
      ).userPickPackageType();

      this.set("request.code", packageType);
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
