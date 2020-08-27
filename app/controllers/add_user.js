import config from "stock/config/environment";
import AsyncMixin, { ERROR_STRATEGIES } from "stock/mixins/async";
import ImageUploadMixin from "stock/mixins/image_upload";
import Ember from "ember";
const { getOwner } = Ember;

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

    if (/^[456789]\d{7}/.test(mobile)) {
      c;
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
    let English = translation.t("organisation.user.languages.english");
    let Chinese = translation.t("organisation.user.languages.chinese");

    return [{ name: English, id: "English" }, { name: Chinese, id: "Chinese" }];
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
    const mobilePhone = this.formatMobileNumber();

    return {
      firstName: this.get("firstName"),
      lastName: this.get("lastName"),
      mobile: mobilePhone,
      email: this.get("email")
    };
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
      let newUser = this.get("store").createRecord(
        "user",
        this.getRequestParams()
      );

      return this.runTask(async () => {
        newUser.set("image", await this.saveImage());

        const { id } = await newUser.save();

        this.clearFormData();
        this.transitionToRoute("user_details", id);
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
