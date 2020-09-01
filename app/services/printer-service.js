import Ember from "ember";
import { toID } from "stock/utils/helpers";
import ApiBaseService from "./api-base-service";

export default ApiBaseService.extend({
  store: Ember.inject.service(),
  session: Ember.inject.service(),

  allAvailablePrinters() {
    return this.get("store")
      .peekAll("printer")
      .sortBy("name")
      .map(printer => printer.getProperties("name", "id"));
  },

  updateUserDefaultPrinter(printerId) {
    const defaultPrinterUser = this.__getStockPrintersUsers().get(
      "firstObject"
    );
    this.PUT(`/printers_users/${defaultPrinterUser.id}`, {
      printers_users: {
        printer_id: printerId
      }
    }).then(data => {
      this.get("store").pushPayload(data);
    });
  },

  addDefaultPrinter(printer) {
    const id = toID(printer);
    this.POST(`/printers_users`, {
      printers_users: {
        printer_id: id,
        user_id: this.get("session.currentUser.id"),
        tag: "stock"
      }
    }).then(data => this.get("store").pushPayload(data));
  },

  getDefaultPrinter() {
    return this.__getStockPrintersUsers().get("firstObject.printer");
  },

  __getStockPrintersUsers() {
    return this.get("store")
      .peekAll("printers_user")
      .filterBy("tag", "stock");
  }
});
