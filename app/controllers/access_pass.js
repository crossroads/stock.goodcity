import Ember from "ember";

export default Ember.Controller.extend({
  i18n: Ember.inject.service(),
  printerService: Ember.inject.service(),

  selectedAccessOption: "today",
  accessPassRoleIds: "",
  selectedPrinterDisplay: "",

  printers: Ember.computed(function() {
    return this.get("printerService").allAvailablePrinters();
  }),

  invalidPassDetails: Ember.computed("accessPassRoleIds", function() {
    return this.get("accessPassRoleIds").trim().length === 0;
  }),

  accessOptions: Ember.computed(function() {
    let translation = this.get("i18n");
    let today = translation.t("access_pass.today");
    let tomorrow = translation.t("access_pass.tomorrow");
    let week = translation.t("access_pass.week");

    return [
      { name: today, id: "today" },
      { name: tomorrow, id: "tomorrow" },
      { name: week, id: "week" }
    ];
  }),

  getSelectionDate(option) {
    let date;

    switch (option) {
      case "today":
        date = moment().format("MM/DD/YYYY");
        break;
      case "tomorrow":
        date = moment()
          .add(1, "days")
          .format("MM/DD/YYYY");
        break;
      case "week":
        date = moment()
          .endOf("week")
          .format("MM/DD/YYYY");
        break;
    }

    date = moment(date)
      .set("hour", 20)
      .set("minutes", 0)
      .format("LLLL");

    return date;
  },

  actions: {
    setPrinterValue(value) {
      const printerId = value.id;
      this.set("selectedPrinterId", printerId);
    },

    generateAccessPass() {
      const roleIds = this.get("accessPassRoleIds");
      const printerId = this.get("selectedPrinterDisplay.id");
      const accessExpiresAt = this.getSelectionDate(
        this.get("selectedAccessOption")
      );

      this.set("accessPassRoleIds", "");

      this.transitionToRoute("display_access_pass", {
        queryParams: { code: 223344 }
      });
    }
  }
});
