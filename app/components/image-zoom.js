import Ember from "ember";
import config from "stock/config/environment";

export default Ember.Component.extend({
  lightGallery: null,
  item: null,
  isMobileApp: config.cordova.enabled,
  parentId: "itemImage",

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
      const parentId = `#${this.get("parentId")}`;
      this._super();
      Ember.run.scheduleOnce("afterRender", this, () => {
        const lightGallery = Ember.$(parentId).lightGallery({
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
