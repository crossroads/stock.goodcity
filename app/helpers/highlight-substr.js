export default Ember.Helper.helper(function(args) {
  const [text, searchStr] = args;
  if (!searchStr) {
    return text;
  }
  const downCaseSearchedString = searchStr.toLowerCase();
  const searchedTextIndex = text.toLowerCase().indexOf(downCaseSearchedString);
  const replacedText = text.substr(searchedTextIndex, searchStr.length);
  return text.replace(
    new RegExp(downCaseSearchedString, "i"),
    `<em>${replacedText}</em>`
  );
});
