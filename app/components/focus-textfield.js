import Ember from "ember";
import { callbackObserver } from "../utils/ember";

export default Ember.TextField.extend({
  tagName: "input",
  type: "text",
  attributeBindings: ["name", "id", "value", "placeholder"],
  cordova: Ember.inject.service(),
  store: Ember.inject.service(),
  hasRecentDesignations: true,
  autofocus: true,
  autofocusOnEmptyValue: true,

  valueAutofocusListener: Ember.observer("value", function() {
    if (
      this.get("autofocus") &&
      this.get("autofocusOnEmptyValue") &&
      this.get("value").length === 0
    ) {
      this.applyFocus();
    }
  }),

  autofocusSettingListener: callbackObserver("autofocus", [
    [true, "applyFocus"]
  ]),

  hasFixedInputHeader: Ember.computed(function() {
    return (
      this.get("cordova").isIOS() && Ember.$(".fixed_search_header").length > 0
    );
  }),

  applyFocus() {
    this.$().trigger("focus");
  },

  scrollToStart() {
    Ember.$(".fixed_search_header").addClass("absolute");
    Ember.$(".footer").addClass("absolute_footer");
    Ember.$(".search").addClass("no-padding");

    document.body.scrollTop = document.documentElement.scrollTop = 0;
  },

  focusOut() {
    if (this.get("hasFixedInputHeader")) {
      Ember.$(".fixed_search_header").removeClass("absolute");
      Ember.$(".footer").removeClass("absolute_footer");
      Ember.$(".search").removeClass("no-padding");
    }
  },

  didInsertElement() {
    document.body.scrollTop = document.documentElement.scrollTop = 0;
    if (this.get("autofocus")) {
      this.applyFocus();
    }
    if (this.get("hasFixedInputHeader")) {
      this.element.addEventListener("touchstart", this.scrollToStart);
    }
  },

  willDestroyElement() {
    if (this.get("hasFixedInputHeader")) {
      this.element.addEventListener("touchstart", this.scrollToStart);
    }
  }
});
