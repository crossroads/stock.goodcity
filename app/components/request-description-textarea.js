import Ember from "ember";
import gcTextarea from "./gc-textarea";
import AjaxPromise from "stock/utils/ajax-promise";
const { getOwner } = Ember;

export default gcTextarea.extend({
  previousValue: "",
  store: Ember.inject.service(),
  request: null,

  focusIn() {
    Ember.$(this.element).addClass("item-description-textarea");
  },
  focusOut() {
    var request = this.get("request");
    var url = `/goodcity_requests/${request.get("id")}`;
    var key = this.get("name");
    var value = this.attrs.value.value || "";
    var requestParams = {};
    requestParams[key] = (this.get("value") || "").trim();

    if (
      requestParams[key].toString() !==
      this.get("previousValue")
        .toString()
        .trim()
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
    this.element.value = value.trim();
    Ember.$(this.element).removeClass("item-description-textarea");
  }
});
