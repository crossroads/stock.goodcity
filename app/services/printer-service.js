import Service, { inject as service } from "@ember/service";
import AjaxPromise from "stock/utils/ajax-promise";

export default Service.extend({
  store: service(),
  session: service(),

  allAvailablePrinters() {
    return this.get("store")
      .peekAll("printer")
      .sortBy("id")
      .map(printer => printer.getProperties("name", "id"));
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
