import Ember from "ember";
import config from "../config/environment";
import AsyncMixin, { ERROR_STRATEGIES } from "stock/mixins/async";
import ImageUploadMixin from "stock/mixins/image_upload";

export default Ember.Component.extend(AsyncMixin, ImageUploadMixin, {
  userService: Ember.inject.service(),
  store: Ember.inject.service(),

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

  actions: {
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
    }
  }
});
