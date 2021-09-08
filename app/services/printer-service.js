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

  printInventoryLabel(item, tag = "stock") {
    const id = toID(item);
    return this.GET(`/packages/${id}/print_inventory_label`, { tag });
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

  addDefaultPrinter(printer, userId, tag) {
    const id = printer ? toID(printer) : null;
    this.POST(`/printers_users`, {
      printers_users: {
        printer_id: id,
        user_id: userId || this.get("session.currentUser.id"),
        tag: tag || "stock"
      }
    }).then(data => this.get("store").pushPayload(data));
  },

  getDefaultPrinter() {
    return this.__getStockPrintersUsers().get("firstObject.printer");
  },

  getDefaultPrinterForUser(userId, tag) {
    tag = tag || "stock";
    var printers_user = this.get("store")
      .peekAll("printers_user")
      .find(row => row.get("tag") === tag && row.get("userId") === +userId);

    return printers_user && printers_user.get("printer");
  },

  __getStockPrintersUsers() {
    return this.get("store")
      .peekAll("printers_user")
      .filterBy("tag", "stock");
  }
});
