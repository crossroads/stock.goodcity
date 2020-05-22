import Ember from "ember";

export default Ember.Mixin.create({
  grades: Ember.computed(function() {
    let grades = ["A", "B", "C", "D"];
    return grades.map(key => ({
      name: key,
      id: key
    }));
  }),

  saleableOptions: Ember.computed(function() {
    return [
      { id: "not_set", name: "Not set", value: "" },
      { id: "saleable", name: "Saleable", value: true },
      { id: "not_selling", name: "Not selling", value: false }
    ];
  }),

  restrictionOptions: Ember.computed(function() {
    return this.store.peekAll("restriction");
  })
});
