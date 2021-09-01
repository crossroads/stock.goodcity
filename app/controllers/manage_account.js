import Ember from "ember";
import config from "../config/environment";
import { regex } from "stock/constants/regex";
import AsyncMixin, { ERROR_STRATEGIES } from "stock/mixins/async";
import TitleAndLanguageMixin from "stock/mixins/grades_option";
import ImageUploadMixin from "stock/mixins/image_upload";

export default Ember.Controller.extend(
  AsyncMixin,
  ImageUploadMixin,
  TitleAndLanguageMixin,
  {
    user: Ember.computed.alias("model.user"),
    userService: Ember.inject.service(),
    printerService: Ember.inject.service(),
    selectedAdminPrinterId: "",
    selectedStockPrinterId: "",

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

    isValidEmail(email) {
      return regex.EMAIL_REGEX.test(email);
    },

    getUserMobile() {
      let mobile = this.get("user.mobile");
      if (mobile) {
        if (mobile.startsWith("+852")) {
          return mobile;
        } else {
          return config.APP.HK_COUNTRY_CODE + mobile;
        }
      }
    },

    isValidMobile(mobile) {
      return regex.HK_MOBILE_NUMBER_REGEX.test(mobile);
    },

    checkUserEmailValidity(email) {
      if (email) {
        return this.isValidEmail(email);
      } else {
        return this.isValidMobile(this.get("mobileNumber"));
      }
    },

    hideValidationErrors(target) {
      this.set(`${target.id}InputError`, false);
      this.set(`${target.id}ValidationError`, false);
    },

    actions: {
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
            isValid = this.checkUserEmailValidity(value);
            break;
        }

        if (isValid) {
          this.runTask(async () => {
            let user = this.get("user");
            user.set(e.target.id, value);
            user.set("mobile", this.getUserMobile());

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

      uploadEditedImageSuccess(e, data) {
        var identifier =
          data.result.version +
          "/" +
          data.result.public_id +
          "." +
          data.result.format;
        var newUploadedImage = this.get("store").createRecord("image", {
          cloudinaryId: identifier,
          favourite: true
        });
        this.set("newUploadedImage", newUploadedImage);
        this.set("userImageKeys", identifier);

        if (this.get("newUploadedImage")) {
          this.send("saveEditedImage");
        }
      },

      saveEditedImage() {
        return this.runTask(async () => {
          let user = this.get("user");
          let image = await this.get("userService").saveImage(
            this.get("newUploadedImage")
          );
          user.set("image", image);
          user.set("mobile", this.getUserMobile());
          user.save();
        }, ERROR_STRATEGIES.MODAL);
      },

      deleteImage() {
        this.runTask(async () => {
          let user = this.get("user");
          if (user.get("image")) {
            await this.get("userService").deleteImage(user.get("image"));
          }
          let data = await this.get("userService").editUser(user.get("id"), {
            user: { image_id: null }
          });
          this.get("store").pushPayload(data);
        }, ERROR_STRATEGIES.MODAL);
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
  }
);
