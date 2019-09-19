import Ember from "ember";

export default Ember.Helper.helper(function([text, regex]) {
  return new RegExp(regex).test(text);
});
