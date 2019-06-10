import detail from "./detail";
import Ember from "ember";
import AjaxPromise from "stock/utils/ajax-promise";
const { getOwner } = Ember;

export default detail.extend({
  showBeneficiaryModal: false,

  titles: Ember.computed(function() {
    return [
      { name: "Mr", id: "Mr" },
      { name: "Mrs", id: "Mrs" },
      { name: "Miss", id: "Miss" },
      { name: "Ms", id: "Ms" }
    ];
  }),

  identityTypes: Ember.computed(function() {
    return this.get("store").peekAll("identity_type");
  }),

  actions: {
    removeBeneficiaryModal() {
      this.toggleProperty("showBeneficiaryModal");
    },

    deleteBeneficiary() {
      const order = this.get("model");
      const beneficiary = order.get("beneficiary");

      if (beneficiary) {
        this.showLoadingSpinner();
        beneficiary
          .destroyRecord()
          .then(() => {
            order.set("beneficiary", null);
            return order.save();
          })
          .finally(() => {
            this.hideLoadingSpinner();
          });
      }
    }
  }
});
