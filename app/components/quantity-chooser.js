import Ember from "ember";
import AjaxPromise from "stock/utils/ajax-promise";
import AsyncMixin, { ERROR_STRATEGIES } from "stock/mixins/async";
const { getOwner } = Ember;

export default Ember.Component.extend(AsyncMixin, {
  messageBox: Ember.inject.service(),
  packageService: Ember.inject.service(),
  store: Ember.inject.service(),
  displayChooseQtyOverlay: false,
  showErrorMessage: false,

  didInsertElement() {
    this.set("displayChooseQtyOverlay", false);
    this.set("showErrorMessage", false);
  },

  resetValue() {
    Ember.$("#qtySplitter").val(1);
  },

  elementValue() {
    return Ember.$("#qtySplitter").val();
  },

  setValueIfValid(value, isValidValue) {
    if (isValidValue) {
      this.set("showErrorMessage", false);
      Ember.$("#qtySplitter").val(value);
    } else {
      this.set("showErrorMessage", true);
    }
  },

  actions: {
    resetValueAndToggleOverlay() {
      this.resetValue();
      this.toggleProperty("displayChooseQtyOverlay");
    },

    incrementQty() {
      let incrementedValue = +this.elementValue() + 1;
      this.setValueIfValid(
        incrementedValue,
        incrementedValue < +this.get("item.availableQuantity")
      );
    },

    decrementQty() {
      let decrementedValue = +this.elementValue() - 1;
      this.setValueIfValid(decrementedValue, decrementedValue >= 1);
    },

    async splitItems() {
      const quantity = this.elementValue();
      const item = this.get("item");

      // if (+quantity < 1 || +quantity >= +item.get("availableQuantity")) {
      //   this.set("showErrorMessage", true);
      //   return false;
      // }

      this.set("showErrorMessage", false);

      await this.runTask(() => {
        return this.get("packageService").splitPackage(item, quantity);
      }, ERROR_STRATEGIES.MODAL);

      this.resetValue();
      this.set("displayChooseQtyOverlay", false);
    }
  }
});
