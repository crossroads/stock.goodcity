import detail from "./detail";
import Ember from "ember";
import AsyncMixin, { ERROR_STRATEGIES } from "stock/mixins/async";

export default detail.extend(AsyncMixin, {
  showBeneficiaryModal: false,
  designationService: Ember.inject.service(),
  orderService: Ember.inject.service(),

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

    updateBeneficiary(field, value) {
      const beneficiary = this.get("model.beneficiary");
      const phoneNumber = field === "phone_number" ? "+852" + value : value;
      this.runTask(
        this.get("designationService").updateBeneficiary(beneficiary.id, {
          beneficiary: {
            [field]: phoneNumber
          }
        })
      );
    },

    deleteBeneficiary() {
      const order = this.get("model");

      this.runTask(() => {
        return this.get("orderService").deleteBeneficiaryOf(order);
      }, ERROR_STRATEGIES.MODAL);
    }
  }
});
