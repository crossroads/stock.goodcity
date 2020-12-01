import Ember from "ember";
import _ from "lodash";
const { getOwner } = Ember;

import AsyncMixin, { ERROR_STRATEGIES } from "stock/mixins/async";
import ItemActions from "stock/mixins/item_actions";

export default Ember.Component.extend(AsyncMixin, ItemActions, {
  packageService: Ember.inject.service(),
  locationService: Ember.inject.service(),

  isValidQuantity: Ember.computed(
    "maxRemovableQuantity",
    "removableQuantity",
    function() {
      let value = +this.get("removableQuantity");
      return value > 0 && value <= +this.get("maxRemovableQuantity");
    }
  ),

  actions: {
    async beginUnpack(container, item, quantity) {
      this.set("openRemoveItemOverlay", false);

      const selectedLocation = await this.get(
        "locationService"
      ).userPickLocation();

      if (!selectedLocation) {
        return;
      } else {
        this.set("removableQuantity", quantity);
        this.set("maxRemovableQuantity", quantity);

        this.set("location", selectedLocation);
        this.set("openRemoveItemOverlay", true);
      }
    },

    async performUnpack() {
      await this.runTask(() => {
        return this.unpack(
          this.get("container"),
          this.get("item"),
          this.get("location.id"),
          this.get("removableQuantity"),
          this.get("onUnpackCallback")
        );
      }, ERROR_STRATEGIES.MODAL);

      this.set("openRemoveItemOverlay", false);
    },

    cancelAction() {
      this.set("openRemoveItemOverlay", false);
    }
  }
});
