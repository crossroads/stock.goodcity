import Ember from "ember";

/**
 * @module Helpers/toggle
 * @description Builds a toggle action
 * @property {any} self the entity which holds the property
 * @property {string} propName the name of the property to toggle
 * @example
 *
 * <button {{action (toggle model "myBoolProperty")}}>
 *  Value: {{ model.myBoolProperty }}
 * </button>
 *
 */
export default Ember.Helper.helper(function([self, propName]) {
  return function() {
    Ember.set(self, propName, !Ember.get(self, propName));
  };
});
