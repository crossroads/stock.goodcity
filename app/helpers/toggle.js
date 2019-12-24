import { set, get } from "@ember/object";
import { helper as buildHelper } from "@ember/component/helper";

/**
 * A toggle action builder
 *
 * Example:
 *
 * <button {{action (toggle model "myBoolProperty")}}>
 *  Value: {{ model.myBoolProperty }}
 * </button>
 *
 * @param {Object} self the object on which to toggle the property
 * @param {String} propName the name of the property to toggle
 * @returns {Function} the action that toggles the property
 */
export default buildHelper(function([self, propName]) {
  return function() {
    set(self, propName, !get(self, propName));
  };
});
