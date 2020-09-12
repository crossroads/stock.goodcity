import Ember from "ember";
import cloudinaryUrl from "./cloudinary_url";
import attr from "ember-data/attr";
import { belongsTo } from "ember-data/relationships";

export default cloudinaryUrl.extend({
  favourite: attr("boolean"),
  cloudinaryId: attr("string"),
  angle: attr("string"),
  itemId: attr("number"),
  item: belongsTo("item", { async: false }),
  user: belongsTo("user", { async: false }),
  imageableId: attr("number"),
  imageableType: attr("string"),

  imageUrl: Ember.computed("cloudinaryId", "angle", function() {
    return this.generateUrl();
  }),

  faceCaptureImageUrl: Ember.computed("cloudinaryId", "angle", function() {
    return this.generateUrl(300, 300, true, true);
  }),

  thumbImageUrl: Ember.computed("cloudinaryId", "angle", function() {
    return this.generateUrl(120, 120, true);
  })
});
