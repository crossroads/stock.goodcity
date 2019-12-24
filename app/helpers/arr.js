import { helper as buildHelper } from "@ember/component/helper";

/**
 * Returns an array
 *
 * Example:
 *
 * {{#my-component
 *   data=(arr 'val1' 'val2' 'val3')
 * }}
 *
 */
export default buildHelper(function(args) {
  return args;
});
