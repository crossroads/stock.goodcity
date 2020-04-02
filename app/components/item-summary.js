import Ember from "ember";

export default Ember.Component.extend({
  favouriteImage: Ember.computed("model", function() {
    return this.get("model.favouriteImage.thumbImageUrl");
  }),

  blankImage: Ember.computed("model", function() {
    return this.get("model").generateUrl(120, 120, true);
  })
});
