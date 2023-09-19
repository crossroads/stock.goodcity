import Ember from "ember";
import { translationMacro as t } from "ember-i18n";
import config from "../../config/environment";
import AjaxPromise from "stock/utils/ajax-promise";
const { getOwner } = Ember;

export default Ember.Controller.extend({
  item: Ember.computed.alias("model"),
  session: Ember.inject.service(),
  store: Ember.inject.service(),
  packageService: Ember.inject.service(),
  messageBox: Ember.inject.service(),
  i18n: Ember.inject.service(),
  cordova: Ember.inject.service(),
  isMobileApp: config.cordova.enabled,

  itemId: null,
  noImage: Ember.computed.empty("item.images"),
  previewImage: null,
  addPhotoLabel: t("edit_images.add_photo"),
  isReady: false,
  isExpanded: false,
  backBtnVisible: true,
  loadingPercentage: t("edit_images.image_uploading"),
  uploadedFileDate: null,

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

  previewMatchesFavourite: Ember.computed(
    "previewImage",
    "favouriteImage",
    function() {
      return this.get("previewImage") === this.get("favouriteImage");
    }
  ),

  images: Ember.computed("item.images.[]", function() {
    //The reason for sorting is because by default it's ordered by favourite
    //then id order. If another image is made favourite then deleted the first image
    //by id order is made favourite which can be second image in list which seems random.

    //Sort by id ascending except place new images id = 0 at end
    return (this.get("item.images") || Ember.A())
      .toArray()
      .sort(function(a, b) {
        if (a && b) {
          a = parseInt(a.get("id"), 10);
          b = parseInt(b.get("id"), 10);
          if (a === 0) {
            return 1;
          }
          if (b === 0) {
            return -1;
          }
          return a - b;
        }
      });
  }),

  favouriteImage: Ember.computed("item.images.@each.favourite", function() {
    return this.get("images")
      .filterBy("favourite")
      .get("firstObject");
  }),

  initPreviewImage: Ember.on(
    "init",
    Ember.observer("model", "model.images.[]", function() {
      var image =
        this.get("item.favouriteImage") || this.get("item.images.firstObject");
      if (image) {
        this.send("setPreview", image);
      }
    })
  ),

  isImageOnLongTermStorage: Ember.computed("previewImage", function() {
    return this.get("previewImage.isImageOnLongTermStorage");
  }),

  //css related
  previewImageBgCss: Ember.computed(
    "previewImage",
    "isExpanded",
    "previewImage.angle",
    {
      get() {
        var css = this.get("instructionBoxCss");
        if (!this.get("previewImage")) {
          return css;
        }

        var imgTag = new Image();
        imgTag.onload = () => {
          var newCSS = new Ember.String.htmlSafe(
            css +
              "background-image:url(" +
              this.get("previewImage.imageUrl") +
              ");" +
              "background-size: " +
              (this.get("isExpanded") ? "contain" : "cover") +
              ";"
          );
          this.set("previewImageBgCss", newCSS);
        };
        imgTag.src = this.get("previewImage.imageUrl");

        return new Ember.String.htmlSafe(
          css +
            "background-image:url('assets/images/image_loading.gif');" +
            "background-size: 'inherit';"
        );
      },

      set(key, value) {
        return value;
      }
    }
  ),

  instructionBoxCss: Ember.computed("previewImage", "isExpanded", function() {
    var height = Ember.$(window).height() * 0.6;
    return new Ember.String.htmlSafe("min-height:" + height + "px;");
  }),

  thumbImageCss: Ember.computed(function() {
    var imgWidth = Math.min(120, Ember.$(window).width() / 4 - 14);
    return new Ember.String.htmlSafe(
      "width:" + imgWidth + "px; height:" + imgWidth + "px;"
    );
  }),

  locale: function(str) {
    return this.get("i18n").t(str);
  },

  removeImage: function(controller, item) {
    var img = item.get("images.firstObject");
    var loadingView = getOwner(controller)
      .lookup("component:loading")
      .append();
    img.deleteRecord();
    img
      .save()
      .then(i => {
        i.unloadRecord();
        this.reloadItem();
        controller.transitionToRoute("items.edit_images", item);
      })
      .finally(() => loadingView.destroy());
  },

  reloadItem: function() {
    var store = this.get("store");
    store.pushPayload(store.findRecord("item", this.get("item.id")));
  },

  confirmRemoveLastImage: function() {
    var item = this.get("item");
    this.get("messageBox").custom(
      this.locale("edit_images.last_image_with_item"),
      this.locale("edit_images.remove_image"),
      () => this.removeImage(this, item),
      "Cancel"
    );
  },

  actions: {
    next() {
      this.transitionToRoute("items.detail", this.get("item.id"));
    },

    setPreview(image) {
      this.get("item.images").setEach("selected", false);
      image.set("selected", true);
      this.set("previewImage", image);
    },

    setFavourite() {
      this.get("item.images").setEach("favourite", false);
      var currentImage = this.get("previewImage");
      currentImage.set("favourite", true);

      new AjaxPromise(
        `/images/${currentImage.get("id")}`,
        "PUT",
        this.get("session.authToken"),
        { image: { favourite: true } }
      )
        .then(data => this.get("store").pushPayload(data))
        .catch(error => {
          this.get("item.images").forEach(img => img.rollbackAttributes());
          throw error;
        });
    },

    deleteImage() {
      if (this.get("item.images.length") === 1) {
        this.confirmRemoveLastImage();
        return;
      } else {
        this.get("messageBox").confirm(
          this.get("i18n").t("edit_images.delete_confirm"),
          () => {
            var loadingView = getOwner(this)
              .lookup("component:loading")
              .append();
            var img = this.get("previewImage");
            img.deleteRecord();
            img
              .save()
              .then(i => {
                i.unloadRecord();
                this.reloadItem();
                this.initPreviewImage();
                if (!this.get("favouriteImage")) {
                  this.send("setFavourite");
                }
              })
              .catch(error => {
                img.rollbackAttributes();
                throw error;
              })
              .finally(() => loadingView.destroy());
          }
        );
      }
    },

    expandImage() {
      var value = this.get("isExpanded");
      this.set("isExpanded", !value);
    },

    //file upload
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
          Ember.$("#photo-list input[type='file']")
            .click()
            .click();
        } else {
          Ember.$("#photo-list input[type='file']").trigger("click");
        }
      }
    },

    uploadReady() {
      this.set("isReady", true);
    },

    uploadStart(e, data) {
      this.set("uploadedFileDate", data);
      Ember.$(".loading-image-indicator").show();
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
      this.set(
        "loadingPercentage",
        this.get("i18n").t("edit_images.image_uploading") + progress + "%"
      );
    },

    uploadComplete(e) {
      e.target.disabled = false; // enable image-selection
      this.set("uploadedFileDate", null);
      Ember.$(".loading-image-indicator.hide_image_loading").hide();
      this.set("addPhotoLabel", this.get("i18n").t("edit_images.add_photo"));
      this.set(
        "loadingPercentage",
        this.get("i18n").t("edit_images.image_uploading")
      );
    },

    uploadSuccess(e, data) {
      var identifier =
        data.result.version +
        "/" +
        data.result.public_id +
        "." +
        data.result.format;
      var item = this.get("item");
      var favourite = item.get("images.length") === 0;
      var imageAttributes = {
        cloudinary_id: identifier,
        imageable_id: this.get("item.id"),
        imageable_type: "Package",
        favourite: favourite
      };

      new AjaxPromise("/images", "POST", this.get("session.authToken"), {
        image: imageAttributes
      }).then(data => {
        this.get("store").pushPayload(data);
        this.send(
          "setPreview",
          this.get("store").peekRecord("image", data.image.id)
        );
      });
    },

    openImageOverlay() {
      this.set("packageService.openImageOverlay", true);
    },

    saveImageURI(image) {
      image.set("imageableId", this.get("item.id"));
      image.set("imageableType", "Package");
      image.save().then(data => {
        this.send("setPreview", this.get("store").peekRecord("image", data.id));
      });
    },

    rotateImageRight() {
      var angle = this.get("previewImage.angle");
      angle = (angle + 90) % 360;
      this.send("rotateImage", angle);
    },

    rotateImageLeft() {
      var angle = this.get("previewImage.angle");
      angle = (angle ? angle - 90 : 270) % 360;
      this.send("rotateImage", angle);
    },

    rotateImage(angle) {
      var image = this.get("previewImage");
      image.set("angle", angle);
      Ember.run.debounce(this, this.saveImageRotation, image, 400);
    }
  },

  saveImageRotation(image) {
    new AjaxPromise(
      `/images/${image.get("id")}`,
      "PUT",
      this.get("session.authToken"),
      { image: { angle: image.get("angle") } }
    ).then(data => this.get("store").pushPayload(data));
  }
});
