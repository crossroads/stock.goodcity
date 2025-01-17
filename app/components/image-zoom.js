import Ember from "ember";
import config from "stock/config/environment";

export default Ember.Component.extend({
  lightGallery: null,
  item: null,
  isMobileApp: config.cordova.enabled,
  showSetImages: false,

  imageUrls: Ember.computed("item.id", function() {
    if (this.get("showSetImages") && this.get("item.isPartOfSet")) {
      return this.get("item.setImages");
    }

    let images = this.get("item.images") || [this.get("item.image")];

    return this.get("captureFaceImage")
      ? images.mapBy("faceCaptureImageUrl")
      : images.mapBy("imageUrl");
  }),

  actions: {
    imageZoom(imageUrl) {
      window.PhotoViewer.show(imageUrl, "", { share: false, headers: "" });
    }
  },

  didInsertElement() {
    if (!this.get("isMobileApp")) {
      this._super();
      Ember.run.scheduleOnce("afterRender", this, () => {
        const lightGallery = this.$()
          .parent()
          .lightGallery({
            mode: "lg-slide",
            zoom: true,
            download: false,
            scale: 1,
            hideControlOnEnd: true,
            closable: true,
            loop: true,
            counter: true,
            enableTouch: true,
            enableDrag: true,
            selector: ".imageZoom"
          });
        this.set("lightGallery", lightGallery);
      });
    }
  },

  willDestroyElement() {
    if (!this.get("isMobileApp")) {
      this.destroy();
    }
  }
});
