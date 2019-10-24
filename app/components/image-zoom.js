import Ember from "ember";
import config from "../config/environment";

export default Ember.Component.extend({
  lightGallery: null,
  item: null,
  isMobileApp: config.cordova.enabled,

  imageUrls: Ember.computed("item.id", function() {
    if (this.get("item.isSet")) {
      return this.get("item.setImages");
    }

    return this.get("item.images").mapBy("imageUrl");
  }),

  actions: {
    imageZoom(imageUrl) {
      window.PhotoViewer.show(imageUrl, "", { share: false });
    }
  },

  didInsertElement() {
    if (!this.get("isMobileApp")) {
      var _this = this;
      this._super();
      Ember.run.scheduleOnce("afterRender", this, function() {
        var lightGallery = Ember.$("#itemImage").lightGallery({
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
        _this.set("lightGallery", lightGallery);
      });
    }
  },

  willDestroyElement() {
    if (!this.get("isMobileApp")) {
      Ember.$("#itemImage")
        .data("lightGallery")
        .destroy(true);
    }
  }
});
