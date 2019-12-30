import Ember from "ember";
import config from "stock/config/environment";
import AsyncMixin, { ERROR_STRATEGIES } from "./async";
import _ from "lodash";

export default Ember.Mixin.create(AsyncMixin, {
  packageService: Ember.inject.service(),

  actions: {
    // this method will be generic and called everytime when
    // user clicks on create item/box/pallet
    // we'll be passing the type from the link itself.
    createInventory(type) {
      this.get("packageService").userPickPackage(type);
    }
  }
});
