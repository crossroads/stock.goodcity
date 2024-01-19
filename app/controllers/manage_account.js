import Ember from "ember";
import AsyncMixin, { ERROR_STRATEGIES } from "stock/mixins/async";
import AjaxPromise from "stock/utils/ajax-promise";
import TitleAndLanguageMixin from "stock/mixins/grades_option";

export default Ember.Controller.extend(AsyncMixin, TitleAndLanguageMixin, {
  user: Ember.computed.alias("model.user"),
  userService: Ember.inject.service(),
  printerService: Ember.inject.service(),
  selectedAdminPrinterId: "",
  selectedStockPrinterId: "",
  showDeleteAccountConfirmationPopup: false,
  application: Ember.inject.controller(),

  getUserMobile() {
    return this.get("userService").getUserMobileWithCode(
      this.get("user.mobile")
    );
  },

  printers: Ember.computed(function() {
    return this.get("printerService").allAvailablePrinters();
  }),

  selectedAdminPrinterDisplay: Ember.computed(
    "model.user.id",
    "selectedAdminPrinterId",
    function() {
      const printerId = this.get("selectedAdminPrinterId");
      return this.get("userService").getPrinterForUser(
        this.get("user"),
        printerId,
        "admin"
      );
    }
  ),

  selectedStockPrinterDisplay: Ember.computed(
    "model.user.id",
    "selectedStockPrinterId",
    function() {
      const printerId = this.get("selectedStockPrinterId");
      return this.get("userService").getPrinterForUser(
        this.get("user"),
        printerId,
        "stock"
      );
    }
  ),

  hideValidationErrors(target) {
    this.set(`${target.id}InputError`, false);
    this.set(`${target.id}ValidationError`, false);
  },

  actions: {
    onDeleteAccount() {
      this.set("showDeleteAccountConfirmationPopup", true);
    },

    cancelAccountDeletion() {
      this.set("showDeleteAccountConfirmationPopup", false);
    },

    confirmDeleteAccount() {
      this.runTask(async () => {
        const userId = this.get("user.id");
        const data = await new AjaxPromise(
          `/users/${userId}`,
          "DELETE",
          this.get("session.authToken")
        );
        this.get("application").send("logMeOut");
        this.set("showDeleteAccountConfirmationPopup", false);
      }, ERROR_STRATEGIES.MODAL);
    },

    updateUserDetails(e) {
      let value = e.target.value.trim();
      let isValid;

      if (Object.keys(this.get("user").changedAttributes()).length === 0) {
        this.hideValidationErrors(e.target);
        return;
      }

      switch (e.target.id) {
        case "firstName":
          isValid = Boolean(value);
          break;
        case "lastName":
          isValid = Boolean(value);
          break;
        case "email":
          isValid = this.get("userService").checkUserEmailValidity(
            value,
            this.get("mobileNumber")
          );
          break;
      }

      if (isValid) {
        this.runTask(async () => {
          let user = this.get("user");
          user.set(e.target.id, value);

          try {
            await user.save();
          } catch (e) {
            this.get("user").rollbackAttributes();
            throw e;
          }
        }, ERROR_STRATEGIES.MODAL);
        this.hideValidationErrors(e.target);
      } else {
        this.get("user").rollbackAttributes();
        Ember.$(`#${e.target.id}`).focus();

        e.target.value
          ? this.set(`${e.target.id}ValidationError`, true)
          : this.set(`${e.target.id}InputError`, true);
      }
    },

    changeAdminPrinter(value) {
      let printerId = value.id;
      this.set("selectedAdminPrinterId", printerId);

      printerId = this.get("selectedAdminPrinterId");
      this.get("printerService").addDefaultPrinter(
        printerId,
        this.get("user.id"),
        "admin"
      );
    },

    changeStockPrinter(value) {
      let printerId = value.id;
      this.set("selectedStockPrinterId", printerId);

      printerId = this.get("selectedStockPrinterId");
      this.get("printerService").addDefaultPrinter(
        printerId,
        this.get("user.id"),
        "stock"
      );
    }
  }
});
