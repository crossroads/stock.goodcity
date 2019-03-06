import Ember from 'ember';
import AjaxPromise from 'stock/utils/ajax-promise';
import BeneficiaryInlineInput from './beneficiary-inline-input';
const { getOwner } = Ember;

export default BeneficiaryInlineInput.extend({
  type: "tel",

  whichKey(e, key) {
    var keyList = [13, 8, 9, 39, 46, 32];
    return e.ctrlKey && key === 86 || keyList.indexOf(key) >= 0 || key >= 48 && key <= 57;
  },

  focusOut() {
    var value = this.attrs.value.value || "";
    var order = this.get("order");
    var url = `/orders/${order.get('id')}`;
    var key = this.get('name');
    var orderParams = {};

    if(value.length === 0 || value === '0') {
      this.set('value', this.get('previousValue'));
      Ember.$(this.element).removeClass('inline-text-input');
      return false;
    }
    orderParams[key] = value;

    Ember.$(this.element).removeClass('inline-text-input');
    if (value !== this.get('previousValue')){
      var loadingView = getOwner(this).lookup('component:loading').append();
      new AjaxPromise(url, "PUT", this.get('session.authToken'), { order: orderParams })
        .then(data => {
          this.get("store").pushPayload(data);
        })
        .finally(() => {
          loadingView.destroy();
        });
    }
    Ember.$(this.element).removeClass('inline-text-input');
  }
});
