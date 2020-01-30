import { set, get } from "@ember/object";
import { helper as buildHelper } from "@ember/component/helper";

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
export default buildHelper(function([self, propName]) {
  return function() {
    set(self, propName, !get(self, propName));
  };
});
