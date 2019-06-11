import detail from "./detail";
import Ember from "ember";
import AjaxPromise from "stock/utils/ajax-promise";
const { getOwner } = Ember;

export default detail.extend({
  showBeneficiaryModal: false,
  showMore: false,
  isShowing: false,

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

  calculatePurposeDescription: Ember.observer(
    "model.purposeDescription",
    function() {
      const isLongDescription =
        this.get("model.purposeDescription.length") > 170;
      if (isLongDescription) {
        this.set("showMore", true);
      } else {
        this.set("showMore", false);
      }
    }
  ),

  shortenedDescription: Ember.computed("isShowing", "showMore", function() {
    let purposeDescription = this.get("model.purposeDescription");
    if (this.get("showMore")) {
      return purposeDescription.substring(0, 170);
    } else {
      return purposeDescription;
    }
  }),

  actions: {
    showMoreToggle() {
      this.toggleProperty("showMore");
    },

    enableEdit(makeEditable = true) {
      this.set("isShowing", makeEditable);
      if (makeEditable) {
        Ember.run.later(() => {
          Ember.$("#desc").click();
        }, 50);
      }
    },

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
