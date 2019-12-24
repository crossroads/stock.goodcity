import $ from "jquery";
import { inject as service } from "@ember/service";
import { getOwner } from "@ember/application";
import itemDescriptionTextarea from "./item-description-textarea";
import AjaxPromise from "stock/utils/ajax-promise";

export default itemDescriptionTextarea.extend({
  previousValue: "",
  store: service(),
  request: null,

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
    $(this.element).removeClass("item-description-textarea");
  }
});
