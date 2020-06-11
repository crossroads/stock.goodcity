import config from "stock/config/environment";
import Ember from "ember";
const { getOwner } = Ember;

export default Ember.Controller.extend({
  queryParams: ["organisationId"],
  organisationId: null,
  organisationName: null,
  existingRoleIds: [],
  selectedRoleIds: [],
  mobilePhone: "",
  newUploadedImage: null,
  disabled: false,
  activeUser: Ember.computed.not("disabled"),

  i18n: Ember.inject.service(),
  messageBox: Ember.inject.service(),
  userImageKeys: Ember.computed.localStorage(),
  isMobileApp: config.cordova.enabled,

  locale: function(str) {
    return this.get("i18n").t(str);
  },

  allRoles: Ember.computed("model.roles.[]", function() {
    let roles = this.get("model.roles");
    let maxRoleLevel = this.get("getCurrentUser.maxRoleLevel");
    return (
      roles &&
      roles
        .rejectBy("name", "System")
        .filter(role => role.get("level") <= maxRoleLevel)
        .sortBy("name")
    );
  }),

  getCurrentUser: Ember.computed(function() {
    let store = this.get("store");
    let currentUser = store.peekAll("user_profile").get("firstObject") || null;
    return currentUser;
  }).volatile(),

  charityRoleId: Ember.computed("model.roles.[]", function() {
    let store = this.get("store");
    let allRoles = store.peekAll("role");
    let charityRole = allRoles.find(role => role.get("name") === "Charity");
    return charityRole && charityRole.get("id");
  }),

  organisationChanged: Ember.observer("organisationId", function() {
    if (this.get("organisationId")) {
      let store = this.get("store");
      let organisation = store.peekRecord(
        "gc_organisation",
        this.get("organisationId")
      );
      this.set("organisationName", organisation && organisation.get("nameEn"));
    }
  }),

  clearFormData() {
    this.set("firstName", "");
    this.set("lastName", "");
    this.set("mobilePhone", "");
    this.set("email", "");
    this.set("selectedRoleIds", []);
    this.set("disabled", false);
    this.set("organisationName", "");
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
      email: this.get("email"),
      disabled: this.get("disabled"),
      organisations_users_ids: [this.get("organisationId")]
    };
  },

  saveImage() {
    let image = this.get("newUploadedImage");
    if (image) {
      return image.save();
    } else {
      return Promise.resolve();
    }
  },

  actions: {
    searchOrganization() {
      this.replaceRoute("search_organisation", {
        queryParams: {
          backToNewUser: true
        }
      });
    },

    setSelecteIds(id, isSelected) {
      if (isSelected) {
        this.get("selectedRoleIds").pushObject(id);
      } else {
        this.get("selectedRoleIds").removeObject(id);
      }

      let hasCharityRole =
        this.get("selectedRoleIds").indexOf(this.get("charityRoleId")) >= 0;
      this.set("displayOrganizationInput", hasCharityRole);
    },

    saveUser() {
      let _this = this;
      const loadingView = getOwner(_this)
        .lookup("component:loading")
        .append();

      let newUser = _this
        .get("store")
        .createRecord("user", _this.getRequestParams());

      if (_this.get("selectedRoleIds.length")) {
        newUser.set("userRoleIds", _this.get("selectedRoleIds"));
      } else {
        newUser.set("userRoleIds", []);
      }

      _this.saveImage().then(imageData => {
        if (imageData) {
          let image = _this.get("store").peekRecord("image", imageData.id);
          newUser.set("image", image);
        }

        newUser
          .save()
          .then(data => {
            this.clearFormData();
            this.transitionToRoute("user_details", data.id);
          })
          .catch(xhr => {
            if (xhr.status === 422) {
              this.get("messageBox").alert(xhr.responseJSON.errors[0].message);
            } else {
              throw xhr;
            }
          })
          .finally(() => loadingView.destroy());
      });
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
    },

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
        Ember.$("input[type='file']").trigger("click");
      }
    }
  }
});
