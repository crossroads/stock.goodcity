import { on } from "@ember/object/evented";
import { computed } from "@ember/object";
import { inject as service } from "@ember/service";
import Component from "@ember/component";
import { getOwner } from "@ember/application";
import AjaxPromise from "stock/utils/ajax-promise";

export default Component.extend({
  layoutName: null,
  isGCRequest: null,

  store: service(),
  messageBox: service(),
  i18n: service(),
  request: null,
  num: null,
  order: null,

  packageTypeName: computed("request.code.name", function() {
    return this.get("request.code.name");
  }),

  onInit: on("init", function() {
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

    removeRequest(reqId) {
      var url = `/goodcity_requests/${reqId}`;
      var req = this.get("store").peekRecord("goodcity_request", reqId);
      var loadingView = getOwner(this)
        .lookup("component:loading")
        .append();
      new AjaxPromise(url, "DELETE", this.get("session.authToken"))
        .then(data => {
          this.get("store").pushPayload(data);
        })
        .finally(() => {
          loadingView.destroy();
          this.get("store").unloadRecord(req);
        });
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
