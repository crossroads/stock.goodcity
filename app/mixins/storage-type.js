import { computed } from "@ember/object";
import { inject as service } from "@ember/service";
import Mixin from "@ember/object/mixin";

export default Mixin.create({
  settings: service(),
  storageTypes: computed(function() {
    return [
      {
        name: "Pallet",
        icon: "pallet",
        translation: "create_new_pallet",
        disable: this.get("settings.disableBoxPalletCreation")
      },
      {
        name: "Box",
        icon: "box-open",
        translation: "create_new_box",
        disable: this.get("settings.disableBoxPalletCreation")
      },
      {
        name: "Package",
        icon: "tag",
        translation: "create_new_item",
        disable: false
      }
    ];
  }),

  storageTypeIcon: computed("item", function() {
    switch (this.get("storageTypeName")) {
      case "Box":
        return "box-open";
      case "Pallet":
        return "pallet";
      default:
        return "tag";
    }
  })
});
