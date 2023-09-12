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

    if (id.indexOf("azure-") === -1) {
      // generate Cloudinary storage url
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
    } else if (id.indexOf("azure-") === 0) {
      // id begins with 'azure-'
      // generate GoodCity Azure storage url (for long term dispatched packages no longer on Cloudinary)
      // this ignores crop, version, angle and facecapture options
      var filename = id.substring(id.indexOf("azure-") + 6);
      return config.APP.LONG_TERM_IMAGE_STORAGE_PREFIX + filename;
    } else {
      return null;
    }
  }
});
