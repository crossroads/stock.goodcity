import Ember from "ember";
import _ from "lodash";
const { getOwner } = Ember;

import AsyncMixin, { ERROR_STRATEGIES } from "stock/mixins/async";

export default Ember.Component.extend(AsyncMixin, {
  packageService: Ember.inject.service(),

  isValidQuantity: Ember.computed(
    "maxRemovableQuantity",
    "removableQuantity",
    function() {
      let value = +this.get("removableQuantity");
      return value > 0 && value <= +this.get("maxRemovableQuantity");
    }
  ),

  actions: {
    cancelAction() {
      this.set("open", false);
    },

    unpackItems() {
      let quantity = this.get("removableQuantity");
    }
  }
});
