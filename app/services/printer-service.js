import Ember from "ember";

export default Ember.Service.extend({
  store: Ember.inject.service(),
  allAvailablePrinters() {
    let availablePrinters = this.get("store").peekAll("printer");
    return availablePrinters.map(printer =>
      printer.getProperties("name", "id")
    );
  }
});
