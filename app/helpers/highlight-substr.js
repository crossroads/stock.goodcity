export default Ember.Helper.helper(function(args) {
  const [text = "", searchStr] = args;
  if (!searchStr) return text;
  return text.replace(new RegExp(`(${searchStr})`, "i"), "<em>$1</em>");
});
