export default Ember.Helper.helper(function([num]) {
  if (num < 0) {
    return `- ${num}`;
  }

  if (num > 0) {
    return `+ ${num}`;
  }

  return `${num}`;
});
