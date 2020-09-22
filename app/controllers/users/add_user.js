import Ember from "ember";
import config from "stock/config/environment";
import AsyncMixin, { ERROR_STRATEGIES } from "stock/mixins/async";
import ImageUploadMixin from "stock/mixins/image_upload";
import { regex } from "stock/constants/regex";
import TitleAndLanguageMixin from "stock/mixins/grades_option";

export default Ember.Controller.extend(
  AsyncMixin,
  ImageUploadMixin,
  TitleAndLanguageMixin,
  {
    newUploadedImage: null,
    email: "",
    i18n: Ember.inject.service(),
    userService: Ember.inject.service(),

    isEmailorMobilePresent: Ember.computed("email", "mobileNumber", function() {
      const emailRegEx = new RegExp(regex.EMAIL_REGEX);
      const hkMobileNumberRegEx = new RegExp(regex.HK_MOBILE_NUMBER_REGEX);
      return !Boolean(
        emailRegEx.test(this.get("email")) ||
          hkMobileNumberRegEx.test(this.get("mobileNumber"))
      );
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

    formatMobileNumber(number) {
      return number ? config.APP.HK_COUNTRY_CODE + number : "";
    },

    async getRequestParams() {
      const mobileNumber = this.formatMobileNumber(this.get("mobileNumber"));
      let title = this.get("selectedTitle.id") || "Mr";
      let language = this.get("selectedLanguage.id");
      let district = this.get("selectedDistrict.id");

      let imageId = await this.uploadImage(this.get("newUploadedImage"));
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

    async uploadImage(image) {
      if (image) {
        const result = await this.get("userService").saveImage(image);
        return result.get("id");
      }
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
