import $ from "jquery";
import { inject as service } from "@ember/service";
import Component from "@ember/component";
import { getOwner } from "@ember/application";
import AjaxPromise from "stock/utils/ajax-promise";

export default Component.extend({
  messageBox: service(),
  store: service(),
  displayChooseQtyOverlay: false,
  showErrorMessage: false,

  didInsertElement() {
    this.set("displayChooseQtyOverlay", false);
    this.set("showErrorMessage", false);
  },

  resetValue() {
    $("#qtySplitter").val(1);
  },

  elementValue() {
    return $("#qtySplitter").val();
  },

  setValueIfValid(value, isValidValue) {
    if (isValidValue) {
      this.set("showErrorMessage", false);
      $("#qtySplitter").val(value);
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
        incrementedValue < +this.get("item.quantity")
      );
    },

    decrementQty() {
      let decrementedValue = +this.elementValue() - 1;
      this.setValueIfValid(decrementedValue, decrementedValue >= 1);
    },

    splitItems() {
      const value = this.elementValue();
      let item = this.get("item");
      if (+value < 1 || +value >= +item.get("quantity")) {
        this.set("showErrorMessage", true);
        return false;
      }
      this.set("showErrorMessage", false);
      let loadingView = getOwner(this)
        .lookup("component:loading")
        .append();
      new AjaxPromise(
        `/items/${item.id}/split_item`,
        "PUT",
        this.get("session.authToken"),
        { package: { quantity: value } }
      )
        .then(data => {
          this.get("store").pushPayload(data);
        })
        .catch(error => {
          if (error.status === 422) {
            var errors = $.parseJSON(error.responseText).errors;
            this.get("messageBox").alert(errors);
          }
        })
        .finally(() => {
          this.resetValue();
          this.set("displayChooseQtyOverlay", false);
          loadingView.destroy();
        });
    }
  }
});
