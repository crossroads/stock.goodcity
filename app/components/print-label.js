import { debounce } from "@ember/runloop";
import $ from "jquery";
import { inject as service } from "@ember/service";
import Component from "@ember/component";
import { getOwner } from "@ember/application";
import AjaxPromise from "stock/utils/ajax-promise";

export default Component.extend({
  item: null,
  messageBox: service(),

  actions: {
    printBarcode() {
      var loadingView = getOwner(this)
        .lookup("component:loading")
        .append();
      new AjaxPromise(
        `/packages/${this.get("item.id")}/print_inventory_label`,
        "GET",
        this.get("session.authToken")
      )
        .catch(xhr => {
          if (xhr.status !== 200) {
            var errors = xhr.responseText;
            try {
              errors = $.parseJSON(xhr.responseText).errors;
            } catch (err) {
              console.log(err);
            }
            this.get("messageBox").alert(errors);
          } else {
            throw xhr;
          }
        })
        .finally(() => {
          loadingView.destroy();
          var element = $(`#printer_message_${this.get("item.id")}`).clone();
          element.prependTo(".printer_message_block");
          this.sendAction("closeList");
          debounce(this, this.hidePrinterMessage, 500);
        });
    }
  },

  hidePrinterMessage() {
    $(".printer_message_block").fadeOut(3000);
    debounce(this, this.removePrinterMessage, 2500);
  },

  removePrinterMessage() {
    $(".printer_message_block").empty();
    $(".printer_message_block").addClass("visible");
  }
});
