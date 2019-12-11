import Ember from "ember";

export default Ember.Mixin.create({
  storageTypes: Ember.computed(function() {
    return [
      {
        name: "Box",
        icon: "box-open",
        translation: "create_new_box"
      },
      {
        name: "Pallet",
        icon: "pallet",
        translation: "create_new_pallet"
      },
      {
        name: "Package",
        icon: "tag",
        translation: "create_new_item"
      }
    ];
  }),

  storageTypeIcon: Ember.computed("item", function() {
    switch (this.get("item.storageType.name")) {
      case "Box":
        return "box-open";
      case "Pallet":
        return "pallet";
      default:
        return "tag";
    }
  })
});
