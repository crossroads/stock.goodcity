import Ember from "ember";
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

    isValidEmail(email) {
      return regex.EMAIL_REGEX.test(email);
    },

    isValidMobile(mobile) {
      return regex.HK_MOBILE_NUMBER_REGEX.test(mobile);
    },

    checkUserEmailValidity(email) {
      if (email) {
        return this.isValidEmail(email);
      } else {
        return (
          this.get("user.disabled") ||
          this.isValidMobile(this.get("mobileNumber"))
        );
      }
    },

    checkUserMobileValidity(mobile) {
      if (mobile) {
        return this.isValidMobile(mobile);
      } else {
        return (
          this.get("user.disabled") || this.isValidEmail(this.get("user.email"))
        );
      }
    },

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
            isValid = this.checkUserEmailValidity(value);
            break;
          case "mobile":
            isValid = this.checkUserMobileValidity(value);

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
  }
);
