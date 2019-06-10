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
    // return [
    //   { name: 'Hong Kong Identity Card', id: 1 },
    //   { name: 'Asylum Seeker Recognizance Form', id: 2}
    // ];
  }),

  actions: {
    removeBeneficiaryModal() {
      this.toggleProperty("showBeneficiaryModal");
    },

    deleteBeneficiary() {
      const beneficiaryId = this.get("model.beneficiaryId");
      var url = `/beneficiaries/${beneficiaryId}`;
      var beneficiary = this.get("store").peekRecord(
        "beneficiary",
        beneficiaryId
      );
      if (beneficiary) {
        var loadingView = getOwner(this)
          .lookup("component:loading")
          .append();
        new AjaxPromise(url, "DELETE", this.get("session.authToken"))
          .then(data => {
            this.get("store").pushPayload(data);
            return new AjaxPromise(
              `/orders/${this.get("model.id")}`,
              "PUT",
              this.get("session.authToken"),
              { order: { beneficiary_id: null } }
            ).then(data => {
              this.get("store").pushPayload(data);
            });
          })
          .finally(() => {
            loadingView.destroy();
            this.get("store").unloadRecord(beneficiary);
          });
      }
    }
  }
});
