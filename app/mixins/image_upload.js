import Ember from "ember";
import _ from "lodash";
import config from "stock/config/environment";

/**
 * ImageUploadMixin
 *
 * @description utilities to save image in cordova application.
 * @mixin ImageUploadMixin
 *
 **/

export default Ember.Mixin.create({
  i18n: Ember.inject.service(),

  locale(str) {
    return this.get("i18n").t(str);
  },

  initActionSheet(onSuccess) {
    return window.plugins.actionsheet.show(
      {
        buttonLabels: [
          this.locale("edit_images.upload").string,
          this.locale("edit_images.camera").string,
          this.locale("edit_images.cancel").string
        ]
      },
      function(buttonIndex) {
        if (buttonIndex === 1) {
          navigator.camera.getPicture(onSuccess, null, {
            quality: 40,
            destinationType: navigator.camera.DestinationType.DATA_URL,
            sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY
          });
        }
        if (buttonIndex === 2) {
          navigator.camera.getPicture(onSuccess, null, {
            correctOrientation: true,
            quality: 40,
            destinationType: navigator.camera.DestinationType.DATA_URL,
            sourceType: navigator.camera.PictureSourceType.CAMERA
          });
        }
        if (buttonIndex === 3) {
          window.plugins.actionsheet.hide();
        }
      }
    );
  },

  actions: {
    uploadReady() {
      this.set("isReady", true);
    },

    uploadStart(e, data) {
      this.set("uploadedFileDate", data);
      Ember.$(".loading-image-indicator").show();
      this.set("loadingPercentage", "Image Uploading ");
    },

    cancelUpload() {
      if (this.get("uploadedFileDate")) {
        this.get("uploadedFileDate").abort();
      }
    },

    uploadProgress(e, data) {
      e.target.disabled = true; // disable image-selection
      var progress = parseInt((data.loaded / data.total) * 100, 10) || 0;
      this.set("loadingPercentage", "Image Uploading " + progress + "%");
    },

    uploadComplete(e) {
      e.target.disabled = false; // enable image-selection
      this.set("uploadedFileDate", null);
      Ember.$(".loading-image-indicator.hide_image_loading").hide();
      this.set("loadingPercentage", "Image Uploading ");
    },

    uploadSuccess(e, data) {
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
    },

    triggerUpload() {
      // For Cordova application
      if (config.cordova.enabled) {
        var onSuccess = (function() {
          return function(path) {
            console.log(path);
            var dataURL = "data:image/jpg;base64," + path;

            Ember.$("input[type='file']").fileupload(
              "option",
              "formData"
            ).file = dataURL;
            Ember.$("input[type='file']").fileupload("add", {
              files: [dataURL]
            });
          };
        })(this);

        this.initActionSheet(onSuccess);
      } else {
        // For web application
        Ember.$("input[type='file']").trigger("click");
      }
    }
  }
});
