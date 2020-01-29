import $ from "jquery";
import { readOnly } from "@ember/object/computed";
import { getOwner } from "@ember/application";
import AjaxPromise from "stock/utils/ajax-promise";
import BeneficiaryInlineInput from "./beneficiary-inline-input";

export default BeneficiaryInlineInput.extend({
  type: "tel",
  orderCopy: readOnly("order"),

  whichKey(e, key) {
    var keyList = [13, 8, 9, 39, 46, 32];
    return (
      (e.ctrlKey && key === 86) ||
      keyList.indexOf(key) >= 0 ||
      (key >= 48 && key <= 57)
    );
  },

  didInsertElement() {
    $(".people-helped").val(this.get("orderCopy.data.peopleHelped"));
  },

  focusOut() {
    var value = this.attrs.value.value || "";
    var order = this.get("order");
    var url = `/orders/${order.get("id")}`;
    var key = this.get("name");
    var orderParams = {};
    var element = this.element;

    if (value.length === 0 || value === "0") {
      this.set("value", "");
      $(element)
        .siblings()
        .show();
      return false;
    }
    orderParams[key] = value;

    $(this.element).removeClass("inline-text-input");
    if (value !== this.get("previousValue")) {
      var loadingView = getOwner(this)
        .lookup("component:loading")
        .append();
      new AjaxPromise(url, "PUT", this.get("session.authToken"), {
        order: orderParams
      })
        .then(data => {
          this.get("store").pushPayload(data);
          $(element)
            .siblings()
            .hide();
        })
        .finally(() => {
          loadingView.destroy();
        });
    }
    $(this.element).removeClass("inline-text-input");
  }
});
