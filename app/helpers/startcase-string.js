import Ember from "ember";
import _ from "lodash";

export default Ember.Helper.helper(function(value) {
  return _.startCase(value[0]);
});
