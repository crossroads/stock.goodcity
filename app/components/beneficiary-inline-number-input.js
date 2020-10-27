import Ember from "ember";
import AjaxPromise from "stock/utils/ajax-promise";
import BeneficiaryInlineInput from "./beneficiary-inline-input";
const { getOwner } = Ember;

export default BeneficiaryInlineInput.extend({
  type: "tel",

  whichKey(e, key) {
    var keyList = [13, 8, 9, 39, 46, 32];
    return (
      (e.ctrlKey && key === 86) ||
      keyList.indexOf(key) >= 0 ||
      (key >= 48 && key <= 57)
    );
  },

  focusOut() {
    var value = this.attrs.value.value.trim() || "";
    var beneficiary = this.get("beneficiary");
    var url = `/beneficiaries/${beneficiary.get("id")}`;
    var key = this.get("name");
    var beneficiaryParams = {};

    if (value.length === 0 || value.length < this.get("maxlength")) {
      this.set("value", this.get("previousValue"));
      Ember.$(this.element).removeClass("inline-text-input");
      return false;
    }
    beneficiaryParams[key] = key === "phone_number" ? "+852" + value : value;

    Ember.$(this.element).removeClass("inline-text-input");
    if (value !== this.get("previousValue")) {
      var loadingView = getOwner(this)
        .lookup("component:loading")
        .append();
      new AjaxPromise(url, "PUT", this.get("session.authToken"), {
        beneficiary: beneficiaryParams
      })
        .then(data => {
          this.get("store").pushPayload(data);
        })
        .finally(() => {
          loadingView.destroy();
        });
    }
    Ember.$(this.element).removeClass("inline-text-input");
  },

  willDestroyElement() {
    this.destroy();
  }
});
