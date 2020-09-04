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
    console.log("dd");
    let email = this.get("user.email");
    return !/^[^@\s]+@[^@\s]+/.test(email);
  }),

  mobileNotPresent: Ember.computed("user.mobileWithoutCountryCode", function() {
    console.log("dd");
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
      district_id: this.get("user.address.district.id") || null
    };
    return { address_attributes };
  },

  actions: {
    focusIn(field, value) {
      this.set(`${field}previousValue`, value);
    },

    focusOut(field, value, required) {
      if (value == this.get(`${field}previousValue`)) {
        return;
      }

      if (field === "mobile" && value.trim()) {
        if (/^[456789]\d{7}/.test(value)) {
          value = "+852" + value;
        } else {
          this.set(
            "user.mobileWithoutCountryCode",
            this.get(`${field}previousValue`)
          );
          return;
        }
      }

      if (
        field === "email" &&
        value.trim() &&
        !/^[^@\s]+@[^@\s]+/.test(value)
      ) {
        this.set(`user.${field}`, this.get(`${field}previousValue`));
        return;
      }

      if (!value.trim() && required) {
        let displayValue =
          field === "mobile" ? "mobileWithoutCountryCode" : field;
        this.set(`user.${displayValue}`, this.get(`${field}previousValue`));
        return;
      }
      return this.runTask(async () => {
        let newUser = this.get("store").peekRecord("user", this.get("user.id"));
        console.log(field);
        newUser.set(field, value);
        await newUser.save();
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
