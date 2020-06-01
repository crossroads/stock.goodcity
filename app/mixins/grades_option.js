import Ember from "ember";
import { SALEABLE_OPTIONS } from "stock/constants/saleable-options";

export default Ember.Mixin.create({
  grades: Ember.computed(function() {
    let grades = ["A", "B", "C", "D"];
    return grades.map(key => ({
      name: key,
      id: key
    }));
  }),

  saleableOptions: Ember.computed(function() {
    return SALEABLE_OPTIONS;
  }),

  restrictionOptions: Ember.computed(function() {
    return this.store.peekAll("restriction");
  })
});
