import Ember from "ember";

export default Ember.Helper.helper(function(value) {
  return Array.isArray(value[0]);
});
