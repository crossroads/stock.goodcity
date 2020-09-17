import config from "stock/config/environment";
import AsyncMixin, { ERROR_STRATEGIES } from "stock/mixins/async";
import ImageUploadMixin from "stock/mixins/image_upload";
import AjaxPromise from "stock/utils/ajax-promise";
import TitleAndLanguageMixin from "stock/mixins/grades_option";
import Ember from "ember";

export default Ember.Controller.extend(
  AsyncMixin,
  ImageUploadMixin,
  TitleAndLanguageMixin,
  {
    newUploadedImage: null,
    i18n: Ember.inject.service(),
    userService: Ember.inject.service(),

    isEmailorMobilePresent: Ember.computed("email", "mobileNumber", function() {
      const email = this.get("email");
      const mobile = this.get("mobileNumber");

      if (/^[456789]\d{7}/.test(mobile) || /^[^@\s]+@[^@\s]+/.test(email)) {
        return false;
      } else {
        return true;
      }
    }),

    districts: Ember.computed(function() {
      return this.get("store")
        .peekAll("district")
        .sortBy("name");
    }),

    clearFormData() {
      this.set("selectedTitle", null);
      this.set("firstName", "");
      this.set("lastName", "");
      this.set("mobileNumber", "");
      this.set("email", "");
      this.set("selectedDistrict", null);
      this.set("selectedLanguage", null);
      this.set("newUploadedImage", null);
    },

    formatMobileNumber() {
      const mobile = this.get("mobileNumber");
      if (mobile.length) {
        return config.APP.HK_COUNTRY_CODE + mobile;
      }
    },

    async getRequestParams() {
      const mobileNumber = this.get("mobileNumber")
        ? this.formatMobileNumber()
        : "";
      let title = this.get("selectedTitle.id") || "Mr";
      let language = this.get("selectedLanguage.id") || null;
      let district = this.get("selectedDistrict.id") || null;

      let { id: imageId } = await this.saveImage(this.get("newUploadedImage"));

      var params = {
        title: title,
        first_name: this.get("firstName"),
        last_name: this.get("lastName"),
        mobile: mobileNumber,
        email: this.get("email"),
        preferred_language: language,
        address_attributes: {
          district_id: district,
          addressable_type: "profile"
        },
        image_id: imageId
      };
      return { user: params };
    },

    saveImage(image) {
      if (image) {
        return image.save();
      }
      return { id: null };
    },

    actions: {
      back() {
        this.clearFormData();
        this.transitionToRoute("manage_users");
      },

      saveUser() {
        return this.runTask(async () => {
          let data = await this.get("userService").createUser(
            await this.getRequestParams()
          );
          this.get("store").pushPayload(data);
          this.clearFormData();
          this.transitionToRoute("users.details", data.user.id);
        }, ERROR_STRATEGIES.MODAL);
      },

      async cancelForm() {
        const confirmed = await this.modalConfirm(
          this.get("i18n").t("users.cancel_user_warning")
        );
        if (!confirmed) {
          return;
        }
        this.clearFormData();
        this.transitionToRoute("manage_users");
      }
    }
  }
);
