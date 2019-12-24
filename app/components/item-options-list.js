import $ from "jquery";
import { computed } from "@ember/object";
import Component from "@ember/component";

export default Component.extend({
  hidden: true,
  item: null,
  designateFullSet: computed.localStorage(),

  toggleItemClass() {
    var item = this.get("item");
    $(".receive-item-options." + item.id).toggleClass("hidden");
    $(".options-link-open." + item.id).toggleClass("hidden");
  },

  actions: {
    toggle(value) {
      this.set("hidden", value);
      var item = this.get("item");
      var itemOptionsLink = $(".options-link-open." + item.id)[0];
      var optionsLink = $(".options-link-open.hidden");
      if (optionsLink.length) {
        $(".receive-item-options")
          .not(".hidden")
          .toggleClass("hidden");
        $(".options-link-open.hidden").toggleClass("hidden");
        //this.toggleItemClass();
        return false;
      } else if (itemOptionsLink) {
        this.toggleItemClass();
        return false;
      } else {
        return true;
      }
    }
  }
});
