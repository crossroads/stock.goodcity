import Ember from 'ember';
import InlineSelectList from './inline-select-list';
import AjaxPromise from 'stock/utils/ajax-promise';
const { getOwner } = Ember;

export default InlineSelectList.extend({
  didRender() {
    let selectedValue = this.get("selectedValue");
    if(this.get("name") === "identity_type_id") {
      selectedValue = this.get("beneficiary.identityTypeId");
    }
    if(selectedValue) {
      Ember.$(`#${this.get("id")} select`).val(selectedValue.name || selectedValue);
    }
  },

  change() {
    var beneficiary = this.get("beneficiary");
    var url = `/beneficiaries/${beneficiary.get('id')}`;
    var key = this.get('name');
    var beneficiaryParams = {};
    var selectedId = this.get('selectedValue').id;
    beneficiaryParams[key] = selectedId;
    var loadingView = getOwner(this).lookup('component:loading').append();
    new AjaxPromise(url, "PUT", this.get('session.authToken'), { beneficiary: beneficiaryParams })
      .then(data => {
        this.get("store").pushPayload(data);
        beneficiary.set("identityTypeId", data.beneficiary.identity_type_id);
      })
      .finally(() => {
        loadingView.destroy();
      });
  }
});
