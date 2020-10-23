import Ember from "ember";
import AsyncMixin, { ERROR_STRATEGIES } from "stock/mixins/async";

export default Ember.Component.extend(AsyncMixin, {
  item: null,
  messageBox: Ember.inject.service(),
  printerService: Ember.inject.service(),

  actions: {
    printBarcode() {
      this.runTask(() => {
        this.get("printerService")
          .printInventoryLabel(this.get("item"))
          .then(() => {
            const element = Ember.$(
              `#printer_message_${this.get("item.id")}`
            ).clone();
            element.prependTo(".printer_message_block");
            this.sendAction("closeList");
            Ember.run.debounce(this, this.hidePrinterMessage, 500);
          });
      }, ERROR_STRATEGIES.MODAL);
    }
  },

  hidePrinterMessage() {
    Ember.$(".printer_message_block").fadeOut(3000);
    Ember.run.debounce(this, this.removePrinterMessage, 2500);
  },

  removePrinterMessage() {
    Ember.$(".printer_message_block").empty();
    Ember.$(".printer_message_block").addClass("visible");
  }
});
