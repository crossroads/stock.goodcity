import Ember from "ember";
import GoodcityController from "./goodcity_controller";

export default GoodcityController.extend({
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

    async generateAccessPass() {
      const accessExpiresAt = this.getSelectionDate(
        this.get("selectedAccessOption")
      );

      const newRecord = this.get("store").createRecord("access-pass", {
        roleIds: this.get("accessPassRoleIds"),
        printerId: `${this.get("selectedPrinterDisplay.id") || ""}`,
        accessExpiresAt: accessExpiresAt
      });

      this.showLoadingSpinner();

      return newRecord
        .save()
        .catch(r => this.onError(r))
        .then(data => {
          this.transitionToRoute("display_access_pass", {
            queryParams: { code: data.data.accessKey }
          });
          this.hideLoadingSpinner();
        });
    }
  }
});
