import detail from "./detail";
import Ember from "ember";
import AjaxPromise from "stock/utils/ajax-promise";
const { getOwner } = Ember;

const LONG_DESCRIPTION_SIZE = 170;

export default detail.extend({
  showBeneficiaryModal: false,
  showMore: false,
  showInlineEdit: false,

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

  isLongDescription: Ember.computed("model.purposeDescription", function() {
    return this.get("model.purposeDescription.length") > LONG_DESCRIPTION_SIZE;
  }),

  toggleShowMore: Ember.observer("isLongDescription", function() {
    const isLongDescription = this.get("isLongDescription");
    if (isLongDescription) {
      this.set("showMore", true);
    } else {
      this.set("showMore", false);
    }
  }),

  shortPurposeDescription: Ember.computed(
    "showInlineEdit",
    "showMore",
    function() {
      let purposeDescription = this.get("model.purposeDescription");
      if (this.get("showMore")) {
        return purposeDescription.substring(0, LONG_DESCRIPTION_SIZE) + "...";
      } else {
        return purposeDescription;
      }
    }
  ),

  actions: {
    showMoreToggle() {
      this.toggleProperty("showMore");
    },

    enableDescriptionEdit(opts = {}) {
      const { makeEditable = true } = opts;
      this.set("showInlineEdit", makeEditable);
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
