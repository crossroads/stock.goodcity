export default Ember.Helper.helper(function([storageType]) {
  return (
    {
      box: "box-open",
      pallet: "pallet"
    }[storageType.toLocaleLowerCase()] || "tag"
  );
});
