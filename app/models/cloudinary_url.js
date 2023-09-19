import Ember from "ember";
import Model from "ember-data/model";
import config from "../config/environment";

export default Model.extend({
  getOptions(version, height, width, crop, id) {
    return {
      version: version,
      height: height,
      width: width,
      crop: crop === true ? "fill" : "fit",
      flags: "progressive",
      id: id,
      secure: true,
      protocol: "https:"
    };
  },

  generateUrl: function(width, height, crop, faceCapture) {
    var id = this.get("cloudinaryId") || "1438323573/default/test_image.jpg";

    if (!id || id.indexOf("/") === -1) {
      return null;
    }

    if (id.indexOf(config.APP.LONG_TERM_IMAGE_STORAGE_ID_PREFIX) === -1) {
      // Not on Azure so generate Cloudinary storage url
      var version = id.split("/")[0];
      var filename = id.substring(id.indexOf("/") + 1);
      var options = this.getOptions(version, height, width, crop, id);
      if (faceCapture) {
        options["gravity"] = "face";
      }
      var angle = this.get("angle");
      if (angle) {
        options["angle"] = angle;
      }
      return Ember.$.cloudinary.url(filename, options);
    } else if (id.indexOf(config.APP.LONG_TERM_IMAGE_STORAGE_ID_PREFIX) === 0) {
      // id begins with config.LONG_TERM_IMAGE_STORAGE_ID_PREFIX (e.g. 'azure-')
      // generate storage url for images that are no longer stored on Cloudinary
      // this ignores most image options except for specific known thumbnails
      var filename = id.substring(
        id.indexOf(config.APP.LONG_TERM_IMAGE_STORAGE_ID_PREFIX) + 6
      );
      if (width <= "300") {
        // Use the stored thumbnail. Hardcoded for now
        // 1438323573/default/test_image.jpg -> 1438323573/default/test_image-300x300.jpg
        filename = filename.replace(/\.([^\.]+)$/, "-300x300.$1");
      }
      return config.APP.LONG_TERM_IMAGE_STORAGE_BASE_URL + filename;
    } else {
      return null;
    }
  }
});
