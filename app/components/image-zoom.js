import $ from "jquery";
import { scheduleOnce } from "@ember/runloop";
import { computed } from "@ember/object";
import Component from "@ember/component";
import config from "stock/config/environment";

export default Component.extend({
  lightGallery: null,
  item: null,
  isMobileApp: config.cordova.enabled,

  imageUrls: computed("item.id", function() {
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
      scheduleOnce("afterRender", this, function() {
        var lightGallery = $("#itemImage").lightGallery({
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
      $("#itemImage")
        .data("lightGallery")
        .destroy(true);
    }
  }
});
