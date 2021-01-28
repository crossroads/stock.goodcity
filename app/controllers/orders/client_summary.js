import detail from "./detail";
import Ember from "ember";
import AsyncMixin, { ERROR_STRATEGIES } from "stock/mixins/async";

export default detail.extend(AsyncMixin, {
  showBeneficiaryModal: false,
  noPurposeDescription: Ember.computed.not("model.purposeDescription"),
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

    updateOrder(field, value) {
      const order = this.get("model");
      let changedAttributes = this.get("model").changedAttributes();
      if (Object.keys(changedAttributes).length === 0) {
        return;
      }

      this.runTask(async () => {
        try {
          await this.get("orderService").updateOrder(order, {
            order: {
              [field]: value
            }
          });
        } catch (e) {
          this.get("model").rollbackAttributes();
          throw e;
        }
      }, ERROR_STRATEGIES.MODAL);
    },

    updatePeopleHelped(e) {
      let value = +e.target.value;
      this.set("order.peopleHelped", value);
      this.send("updateOrder", e.target.name, value);
    },

    updatePurposeDescription(e) {
      if (this.get("noPurposeDescription")) {
        this.get("model").rollbackAttributes();
        return;
      }
      this.send("updateOrder", e.target.name, e.target.value);
    },

    deleteBeneficiary() {
      const order = this.get("model");

      this.runTask(() => {
        return this.get("orderService").deleteBeneficiaryOf(order);
      }, ERROR_STRATEGIES.MODAL);
    }
  }
});
