export default Ember.Helper.helper(function([storageType]) {
  if (!storageType) {
    return "tag";
  }
  return {
    box: "box-open",
    pallet: "pallet",
    package: "tag"
  }[storageType.toLocaleLowerCase()];
});
