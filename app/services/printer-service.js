import Ember from "ember";

export default Ember.Service.extend({
  store: Ember.inject.service(),
  allAvailablePrinter() {
    let availablePrinters = this.get("store").peekAll("printer");
    let printers = [];
    availablePrinters.map(printer => {
      let tag = printer.get("name");
      printers.push({ id: printer.get("id"), tag: tag });
    });
    return printers;
  }
});
