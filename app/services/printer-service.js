import Ember from "ember";
import AjaxPromise from "stock/utils/ajax-promise";

export default Ember.Service.extend({
  store: Ember.inject.service(),
  session: Ember.inject.service(),

  allAvailablePrinters() {
    let availablePrinters = this.get("store").peekAll("printer");
    return availablePrinters.map(printer =>
      printer.getProperties("name", "id")
    );
  },
  updateUserDefaultPrinter(printerId) {
    new AjaxPromise(
      `/users/${this.get("session.currentUser.id")}`,
      "PUT",
      this.get("session.authToken"),
      { user: { printer_id: printerId } }
    ).then(data => this.get("store").pushPayload(data));
  }
});
