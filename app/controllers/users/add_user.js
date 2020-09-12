import config from "stock/config/environment";
import AsyncMixin, { ERROR_STRATEGIES } from "stock/mixins/async";
import ImageUploadMixin from "stock/mixins/image_upload";
import AjaxPromise from "stock/utils/ajax-promise";
import Ember from "ember";

export default Ember.Controller.extend(AsyncMixin, ImageUploadMixin, {
  newUploadedImage: null,
  i18n: Ember.inject.service(),
  messageBox: Ember.inject.service(),

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

  setEmailorMobile: Ember.computed("email", "mobilePhone", function() {
    const email = this.get("email");
    const mobile = this.get("mobilePhone");

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

  languages: Ember.computed(function() {
    let translation = this.get("i18n");
    let English = translation.t("users.languages.english");
    let Chinese = translation.t("users.languages.chinese");

    return [{ name: English, id: "en" }, { name: Chinese, id: "zh-tw" }];
  }),

  locale: function(str) {
    return this.get("i18n").t(str);
  },

  clearFormData() {
    this.set("selectedTitle", null);
    this.set("firstName", "");
    this.set("lastName", "");
    this.set("mobilePhone", "");
    this.set("email", "");
    this.set("selectedDistrict", null);
    this.set("selectedLanguage", null);
    this.set("newUploadedImage", null);
  },

  formatMobileNumber() {
    const mobile = this.get("mobilePhone");
    if (mobile.length) {
      return config.APP.HK_COUNTRY_CODE + mobile;
    }
  },

  getRequestParams() {
    const mobilePhone = this.get("mobilePhone")
      ? this.formatMobileNumber()
      : "";
    let title = this.get("selectedTitle") ? this.get("selectedTitle").id : "Mr";
    let language = this.get("selectedLanguage")
      ? this.get("selectedLanguage").id
      : null;
    let district = this.get("selectedDistrict")
      ? this.get("selectedDistrict").id
      : null;
    var params = {
      title: title,
      first_name: this.get("firstName"),
      last_name: this.get("lastName"),
      mobile: mobilePhone,
      email: this.get("email"),
      preferred_language: language,
      address_attributes: {
        district_id: district,
        addressable_type: "profile"
      }
    };
    return { user: params };
  },

  saveImage() {
    let image = this.get("newUploadedImage");
    if (image) {
      return image.save();
    }
  },

  actions: {
    back() {
      this.clearFormData();
      this.transitionToRoute("manage_users");
    },

    saveUser() {
      return this.runTask(async () => {
        let data = await new AjaxPromise(
          "/users",
          "POST",
          this.get("session.authToken"),
          this.getRequestParams()
        );
        this.get("store").pushPayload(data);
        let newUser = this.get("store").peekRecord("user", data.user.id);
        newUser.set("image", await this.saveImage());
        const { id } = await newUser.save();
        this.clearFormData();
        this.transitionToRoute("users.details", id);
      }, ERROR_STRATEGIES.MODAL);
    },

    cancelForm() {
      this.get("messageBox").custom(
        this.locale("users.cancel_user_warning").string,
        this.locale("yes").string,
        () => {
          Ember.run.later(
            this,
            function() {
              this.transitionToRoute("manage_users");
              this.clearFormData();
            },
            0
          );
        },
        this.locale("no").string
      );
    }
  }
});
