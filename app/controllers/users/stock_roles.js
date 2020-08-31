import Ember from "ember";

export default Ember.Controller.extend({
  printerService: Ember.inject.service(),
  printers: [],
  defaultPrinter: "",

  init() {
    let printers = this.get("printerService").allAvailablePrinters();

    this.set("printers", printers);
    this.set("defaultPrinter", printers[0]);
  },

  actions: {
    onPrinterChange() {},

    cancelForm() {},

    saveUserRoles() {}
  }
});
