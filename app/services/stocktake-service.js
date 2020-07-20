import ApiBaseService from "./api-base-service";
import { toID } from "../utils/helpers";

export default ApiBaseService.extend({
  store: Ember.inject.service(),

  async commitStocktake(stocktake) {
    if (stocktake.get("isOpen")) {
      const data = await this.PUT(`/stocktakes/${toID(stocktake)}/commit`);
      this.get("store").pushPayload(data);
    }

    return stocktake;
  }
});
