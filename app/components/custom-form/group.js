import Ember from "ember";

export default Ember.Component.extend({
  tagName: "",

  uniqueId: Ember.computed(function() {
    return `${Ember.guidFor(this)}-group`;
  })
});
