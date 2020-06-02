import _ from "lodash";
import Ember from "ember";
import { SALEABLE_OPTIONS } from "stock/constants/saleable-options";

export default Ember.Mixin.create({
  i18n: Ember.inject.service(),

  grades: Ember.computed(function() {
    let grades = ["A", "B", "C", "D"];
    return grades.map(key => ({
      name: key,
      id: key
    }));
  }),

  saleableOptions: Ember.computed(function() {
    return _.map(SALEABLE_OPTIONS, obj => {
      return { ...obj, name: this.get("i18n").t(obj.translation_key).string };
    });
  }),

  restrictionOptions: Ember.computed(function() {
    return this.store.peekAll("restriction");
  })
});
