import detail from "./detail";
import Ember from "ember";
import AjaxPromise from 'stock/utils/ajax-promise';
const { getOwner } = Ember;

export default detail.extend({
  sortProperties: ["id"],
  sortedGcRequests: Ember.computed.sort("model.goodcityRequests", "sortProperties"),

  actions: {
    deleteRequest(reqId) {
      this.get("messageBox").custom(
      "Remove this request from order " + this.get("model.code"),
      "Remove", () => this.send("removeRequest", reqId),
      "Not Now"
    );
    },

    removeRequest(reqId) {
      var url = `/goodcity_requests/${reqId}`;
      var req = this.get("store").peekRecord("goodcity_request", reqId);
      var loadingView = getOwner(this).lookup('component:loading').append();
      new AjaxPromise(url, "DELETE", this.get('session.authToken'))
        .then(data => {
          this.get("store").pushPayload(data);
        })
        .finally(() => {
          loadingView.destroy();
          this.get("store").unloadRecord(req);
        });
    }
  }
});
