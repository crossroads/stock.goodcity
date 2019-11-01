import Ember from "ember";
import _ from "lodash";

export default Ember.Mixin.create({
  grades: Ember.computed(function() {
    let grades = ["A", "B", "C", "D"];
    return grades.map(key => ({
      name: key,
      id: key
    }));
  })
});
