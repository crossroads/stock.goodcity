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

  /**
   * Will apply all the revisions of a stocktake to the inventory and mark the stocktake as "Closed"
   *
   * @param {Stocktake|string} stocktake a stocktake model or its ID
   * @returns {Promise<Stocktake>}
   */
  commitStocktake(stocktake) {
    return this.__applyAction(stocktake, "commit");
  },

  /**
   * Will cancel a stocktake and all of its revisions
   *
   * @param {Stocktake|string} stocktake a stocktake model or its ID
   * @returns {Promise<Stocktake>}
   */
  cancelStocktake(stocktake) {
    return this.__applyAction(stocktake, "cancel");
  }
});
