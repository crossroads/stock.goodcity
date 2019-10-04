import Ember from "ember";
import Model from "ember-data/model";

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

  generateUrl: function(width, height, crop) {
    var id = this.get("cloudinaryId") || "1438323573/default/test_image.jpg";

    if (!id || id.indexOf("/") === -1) {
      return null;
    }

    var version = id.split("/")[0];
    var filename = id.substring(id.indexOf("/") + 1);
    var options = this.getOptions(version, height, width, crop, id);
    var angle = this.get("angle");
    if (angle) {
      options["angle"] = angle;
    }
    return Ember.$.cloudinary.url(filename, options);
  }
});
