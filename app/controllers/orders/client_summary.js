import detail from "./detail";
import Ember from 'ember';
import AjaxPromise from 'stock/utils/ajax-promise';
const { getOwner } = Ember;

export default detail.extend({
  showBeneficiaryModal: false,

  actions: {
    removeBeneficiaryModal() {
      this.toggleProperty('showBeneficiaryModal');
    },

    deleteBeneficiary() {
      const beneficiaryId = this.get("model.beneficiaryId");
      var url = `/beneficiaries/${beneficiaryId}`;
      var beneficiary = this.get("store").peekRecord("beneficiary", beneficiaryId);
      if(beneficiary) {
        var loadingView = getOwner(this).lookup('component:loading').append();
        new AjaxPromise(url, "DELETE", this.get('session.authToken'))
          .then(data => {
            this.get("store").pushPayload(data);
            return new AjaxPromise(`/orders/${this.get("model.id")}`, "PUT", this.get('session.authToken'), { order: { beneficiary_id: null } })
              .then(data => {
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
