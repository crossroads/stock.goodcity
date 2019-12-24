import { computed } from "@ember/object";
import cloudinaryUrl from "./cloudinary_url";
import attr from "ember-data/attr";
import { belongsTo } from "ember-data/relationships";

export default cloudinaryUrl.extend({
  favourite: attr("boolean"),
  cloudinaryId: attr("string"),
  angle: attr("string"),
  itemId: attr("number"),
  item: belongsTo("item", { async: false }),

  imageableId: attr("number"),
  imageableType: attr("string"),

  imageUrl: computed("cloudinaryId", "angle", function() {
    return this.generateUrl();
  }),

  thumbImageUrl: computed("cloudinaryId", "angle", function() {
    return this.generateUrl(120, 120, true);
  })
});
