import $ from "jquery";
import Component from "@ember/component";

export default Component.extend({
  click() {
    var itemOptionsLink = $(".options-link-open.hidden");
    if (itemOptionsLink.length) {
      $(".receive-item-options")
        .not(".hidden")
        .toggleClass("hidden");
      $(".options-link-open.hidden").toggleClass("hidden");
      return false;
    } else {
      return true;
    }
  }
});
