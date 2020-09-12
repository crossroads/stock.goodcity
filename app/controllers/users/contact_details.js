import Ember from "ember";
import AjaxPromise from "stock/utils/ajax-promise";
import AsyncMixin, { ERROR_STRATEGIES } from "stock/mixins/async";
import ImageUploadMixin from "stock/mixins/image_upload";

export default Ember.Controller.extend(AsyncMixin, ImageUploadMixin, {
  user: Ember.computed.alias("model.user"),

  titles: Ember.computed(function() {
    let translation = this.get("i18n");
    let mr = translation.t("order.user_title.mr");
    let mrs = translation.t("order.user_title.mrs");
    let miss = translation.t("order.user_title.miss");
    let ms = translation.t("order.user_title.ms");

    return [
      { name: mr, id: "Mr" },
      { name: mrs, id: "Mrs" },
      { name: miss, id: "Miss" },
      { name: ms, id: "Ms" }
    ];
  }),

  languages: Ember.computed(function() {
    let translation = this.get("i18n");
    let English = translation.t("organisation.user.languages.english");
    let Chinese = translation.t("organisation.user.languages.chinese");

    return [{ name: English, id: "en" }, { name: Chinese, id: "zh-tw" }];
  }),

  emailIdNotPresent: Ember.computed("user.email", function() {
    let email = this.get("user.email");
    return !/^[^@\s]+@[^@\s]+/.test(email);
  }),

  mobileNotPresent: Ember.computed("user.mobileWithoutCountryCode", function() {
    let mobile = this.get("user.mobileWithoutCountryCode");
    return !/^[456789]\d{7}/.test(mobile);
  }),

  districts: Ember.computed(function() {
    return this.get("store")
      .peekAll("district")
      .sortBy("name");
  }),

  getUpdatedDistrictParams() {
    let address_attributes = {
      district_id: this.get("user.associatedDistrict.id") || null
    };
    return { address_attributes };
  },

  saveImage() {
    let image = this.get("newUploadedImage");
    if (image) {
      return image.save();
    }
  },
  deleteOldImage(img) {
    if (img) {
      img.deleteRecord();
      return img.save();
    }
  },
  actions: {
    focusIn(field, value) {
      this.set(`${field}previousValue`, value);
    },

    focusOut(field, value, required) {
      if (value == this.get(`${field}previousValue`)) {
        this.set(`${field}InputError`, false);
        this.set("emailValidationError", false);
        this.set("mobileValidationError", false);
        return;
      }

      if (field === "mobile" && value.trim()) {
        if (/^[456789]\d{7}/.test(value)) {
          value = "+852" + value;
        } else {
          this.set("mobileValidationError", true);
          this.set(
            "user.mobileWithoutCountryCode",
            this.get(`${field}previousValue`)
          );
          Ember.$("#mobile").focus();
          return;
        }
      }

      if (
        field === "email" &&
        value.trim() &&
        !/^[^@\s]+@[^@\s]+/.test(value)
      ) {
        this.set("emailValidationError", true);
        this.set(`user.${field}`, this.get(`${field}previousValue`));
        Ember.$("#email").focus();
        return;
      }

      if (!value.trim() && required) {
        let displayValue =
          field === "mobile" ? "mobileWithoutCountryCode" : field;
        this.set(`${field}InputError`, true);
        this.set(`user.${displayValue}`, this.get(`${field}previousValue`));
        Ember.$(`#${field}`).focus();
        return;
      }
      return this.runTask(async () => {
        let newUser = this.get("store").peekRecord("user", this.get("user.id"));
        newUser.set(field, value);
        await newUser.save();
        this.set(`${field}InputError`, false);
        this.set("emailValidationError", false);
        this.set("mobileValidationError", false);
      }, ERROR_STRATEGIES.MODAL);
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
      this.send("saveEditedImage");
    },

    async saveEditedImage() {
      this.runTask(async () => {
        let newUser = this.get("store").peekRecord("user", this.get("user.id"));
        newUser.set("image", await this.saveImage());
        newUser.save();
      }, ERROR_STRATEGIES.MODAL);
    },

    deleteImage() {
      this.runTask(async () => {
        let newUser = this.get("store").peekRecord("user", this.get("user.id"));
        await this.deleteOldImage(newUser.get("image"));
        let data = await new AjaxPromise(
          "/users/" + this.get("user.id"),
          "PUT",
          this.get("session.authToken"),
          { user: { image_id: null } }
        );
        this.get("store").pushPayload(data);
      }, ERROR_STRATEGIES.MODAL);
    },

    changeDistrict() {
      return this.runTask(async () => {
        const id = this.get("user.id");
        let data = await new AjaxPromise(
          "/users/" + id,
          "PUT",
          this.get("session.authToken"),
          { user: this.getUpdatedDistrictParams() }
        );
        this.get("store").pushPayload(data);
      }, ERROR_STRATEGIES.MODAL);
    }
  }
});
