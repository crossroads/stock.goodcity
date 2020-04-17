import Ember from "ember";

export default Ember.Component.extend({
  parentId: "epsilon",

  compositeParentId: Ember.computed("parentId", function() {
    const parentId = this.get("parentId");
    return `parent-${parentId}`;
  }),

  favouriteImage: Ember.computed("model", function() {
    return this.get("model.favouriteImage.thumbImageUrl");
  }),

  blankImage: Ember.computed("model", function() {
    return this.get("model").generateUrl(120, 120, true);
  })
});
