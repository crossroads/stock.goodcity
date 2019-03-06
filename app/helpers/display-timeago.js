import Ember from "ember";

export default Ember.Helper.helper(function(value) {
  var parseDate = Date.parse(value);
  return moment(parseDate).fromNow();
});