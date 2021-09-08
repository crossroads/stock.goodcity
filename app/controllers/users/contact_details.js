import Ember from "ember";
import AsyncMixin, { ERROR_STRATEGIES } from "stock/mixins/async";
import TitleAndLanguageMixin from "stock/mixins/grades_option";

export default Ember.Controller.extend(AsyncMixin, TitleAndLanguageMixin, {
  user: Ember.computed.alias("model.user"),
  userService: Ember.inject.service(),

  hideValidationErrors(target) {
    this.set(`${target.id}InputError`, false);
    this.set(`${target.id}ValidationError`, false);
  },

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
          isValid = this.get("userService").checkUserEmailValidity(
            value,
            this.get("mobileNumber")
          );
          break;
        case "mobile":
          isValid = this.get("userService").checkUserMobileValidity(
            value,
            this.get("user.email")
          );
          break;
      }

      if (isValid) {
        this.runTask(async () => {
          let user = this.get("user");
          value = e.target.id == "mobile" && value ? "+852" + value : value;
          user.set(e.target.id, value);
          try {
            await user.save();
          } catch (e) {
            this.get("user").rollbackAttributes();
            let phoneNumber =
              this.get("user.mobile") && this.get("user.mobile").slice(4);
            this.set("mobileNumber", phoneNumber);
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

    updateMobile(e) {
      let value = e.target.value.trim();
      let mobileCode = value ? "+852" : "";
      this.set("user.mobile", mobileCode + this.get("mobileNumber"));
      this.send("updateUserDetails", e);
    },

    changeDistrict() {
      return this.runTask(async () => {
        const id = this.get("user.id");
        let data = await this.get("userService").editUser(id, {
          user: this.getUpdatedDistrictParams()
        });
        this.get("store").pushPayload(data);
      }, ERROR_STRATEGIES.MODAL);
    }
  }
});
