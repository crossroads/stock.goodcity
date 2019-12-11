import Ember from "ember";

export default Ember.Service.extend({
  store: Ember.inject.service(),
  allAvailablePrinters() {
    let availablePrinters = this.get("store").peekAll("printer");
    let printers = [];
    availablePrinters.map(printer => {
      let tag = printer.get("name");
      printers.push({ name: tag, id: printer.get("id") });
    });
    return printers;
  }
});
