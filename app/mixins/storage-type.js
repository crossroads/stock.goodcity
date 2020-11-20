import Ember from "ember";

export default Ember.Mixin.create({
  settings: Ember.inject.service(),
  storageTypes: Ember.computed(function() {
    return [
      {
        name: "Pallet",
        icon: "pallet",
        translation: "create_new_pallet",
        disable: false
      },
      {
        name: "Box",
        icon: "box-open",
        translation: "create_new_box",
        disable: false
      },
      {
        name: "Package",
        icon: "tag",
        translation: "create_new_item",
        disable: false
      }
    ];
  })
});
