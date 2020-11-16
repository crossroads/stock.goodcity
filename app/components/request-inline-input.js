import Ember from "ember";
import numericInlineInput from "./numeric-inline-input";
import AjaxPromise from "stock/utils/ajax-promise";
const { getOwner } = Ember;

export default numericInlineInput.extend({
  getRequestParams() {
    return { quantity: this.get("value") || "" };
  },

  isEmptyQty(requestParams) {
    let parsedQty = parseInt(requestParams["quantity"], 10);
    if (parsedQty === 0 || Number.isNaN(parsedQty)) {
      Ember.$(this.element).removeClass("numeric-inline-input");
      this.set("value", this.get("previousValue"));
      return false;
    }
    return true;
  },

  focusOut() {
    var val = this.attrs.value.value;
    var regexPattern = /^\d+$/;
    if (val && val.toString().search(regexPattern) !== 0) {
      this.set("value", val.replace(/\D/g, ""));
    }
    var request = this.get("request");
    var url = `/goodcity_requests/${request.get("id")}`;
    var requestParams = this.getRequestParams();
    if (!this.isEmptyQty(requestParams)) {
      return false;
    }

    Ember.$(this.element).removeClass("numeric-inline-input");
    if (
      requestParams["quantity"].toString() !==
      this.get("previousValue").toString()
    ) {
      var loadingView = getOwner(this)
        .lookup("component:loading")
        .append();
      new AjaxPromise(url, "PUT", this.get("session.authToken"), {
        goodcity_request: requestParams
      })
        .then(data => {
          this.get("store").pushPayload(data);
        })
        .finally(() => {
          loadingView.destroy();
        });
    }
  }
});
