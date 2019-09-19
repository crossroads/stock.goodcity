import Ember from "ember";

/**
 * A regex match helper
 *
 * Example:
 *
 * {{#if (matches myString '^(foo|bar)$')}}
 *   It matches !
 * {{/if}}
 *
 * @param {String} text the text to test
 * @param {String} regex the regex to test the text against
 * @returns {Boolean}
 */
export default Ember.Helper.helper(function([text, regex]) {
  return new RegExp(regex).test(text);
});
