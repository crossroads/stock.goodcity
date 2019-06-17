import detail from "./detail";
import Ember from "ember";
import AjaxPromise from "stock/utils/ajax-promise";
const { getOwner } = Ember;

const LONG_DESCRIPTION_SIZE = 170;

export default detail.extend({
  showBeneficiaryModal: false,
  displayShowMore: true,
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

  toggleDisplayShowMore: Ember.observer("model.purposeDescription", function() {
    const isLongDescription = this.get("isLongDescription");
    isLongDescription
      ? this.set("displayShowMore", true)
      : this.set("displayShowMore", false);
  }),

  shortPurposeDescription: Ember.computed(
    "showInlineEdit",
    "displayShowMore",
    function() {
      let purposeDescription = this.get("model.purposeDescription");
      if (this.get("displayShowMore")) {
        return purposeDescription.substring(0, LONG_DESCRIPTION_SIZE) + "...";
      } else {
        return purposeDescription;
      }
    }
  ),

  actions: {
    showMoreToggle() {
      this.toggleProperty("displayShowMore");
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

    updatePurposeDescription(purposeDescription) {
      const order = this.get("model");
      this.showLoadingSpinner();
      order.set("purposeDescription", purposeDescription);
      order
        .save()
        .then(() => {
          Ember.$(".client_summary_description_error").hide();
        })
        .finally(() => {
          this.hideLoadingSpinner();
        });
      this.send("enableDescriptionEdit", { makeEditable: false });
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
