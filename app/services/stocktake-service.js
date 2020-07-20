import ApiBaseService from "./api-base-service";
import { toID } from "../utils/helpers";

export default ApiBaseService.extend({
  store: Ember.inject.service(),

  async __applyAction(stocktake, action) {
    if (stocktake.get("isOpen")) {
      const data = await this.PUT(`/stocktakes/${toID(stocktake)}/${action}`);
      this.get("store").pushPayload(data);
    }

    return stocktake;
  },

  commitStocktake(stocktake) {
    return this.__applyAction(stocktake, "commit");
  },

  cancelStocktake(stocktake) {
    return this.__applyAction(stocktake, "cancel");
  }
});
