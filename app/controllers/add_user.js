import config from "stock/config/environment";
import Ember from "ember";
const { getOwner } = Ember;
import AjaxPromise from "stock/utils/ajax-promise";

export default Ember.Controller.extend({
  mobilePhone: "",
  disabled: false,
  activeUser: Ember.computed.not("disabled"),
  i18n: Ember.inject.service(),
  messageBox: Ember.inject.service(),

  newUploadedImage: null,
  userImageKeys: Ember.computed.localStorage(),

  isMobileApp: config.cordova.enabled,

  clearFormData() {
    this.set("firstName", "");
    this.set("lastName", "");
    this.set("mobilePhone", "");
    this.set("email", "");
  },

  formatMobileNumber() {
    const mobile = this.get("mobilePhone");
    if (mobile.length) {
      return config.APP.HK_COUNTRY_CODE + mobile;
    }
  },

  getRequestParams() {
    const mobilePhone = this.formatMobileNumber();
    const params = {
      user_attributes: {
        first_name: this.get("firstName"),
        last_name: this.get("lastName"),
        mobile: mobilePhone,
        email: this.get("email"),
        disabled: this.get("disabled")
      }
    };
    return {
      user: params
    };
  },

  actions: {
    saveUser() {
      const loadingView = getOwner(this)
        .lookup("component:loading")
        .append();
      new AjaxPromise(
        "/users",
        "POST",
        this.get("session.authToken"),
        this.getRequestParams()
      )
        .then(data => {
          this.get("store").pushPayload(data);
          this.clearFormData();
          // this.transitionToRoute(
          //   "organisations.users",
          //   this.get("organisationId")
          // );
        })
        .catch(xhr => {
          if (xhr.status === 422) {
            this.get("messageBox").alert(xhr.responseJSON.errors[0].message);
          } else {
            throw xhr;
          }
        })
        .finally(() => loadingView.destroy());
    },

    cancelForm() {
      this.get("messageBox").custom(
        "You will lose all your data. Are you sure you want to cancel this item?",
        "Yes",
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
        "No"
      );
    },

    updateStoreAndSaveImage(data) {
      this.get("store").pushPayload(data);
      var image = this.get("newUploadedImage");
      if (image) {
        image.setProperties({
          imageableId: data.item.id,
          imageableType: "User"
        });
        image.save();
      }
    },

    uploadReady() {
      this.set("isReady", true);
    },

    uploadStart(e, data) {
      // this.send("deleteUnusedImage");
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
      this.set("addPhotoLabel", progress + "%");
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

    initActionSheet: function(onSuccess) {
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
        if (navigator.userAgent.match(/iemobile/i)) {
          //don't know why but on windows phone need to click twice in quick succession
          //for dialog to appear
          Ember.$("input[type='file']")
            .click()
            .click();
        } else {
          Ember.$("input[type='file']").trigger("click");
        }
      }
    }
  }
});
