import Cache from "../../utils/cache";
import getOrderRoute from "./get_order";
import Ember from "ember";

export default getOrderRoute.extend({
  currentRouteName: null,

  model(params) {
    const store = this.get("store");
    const model = "designation";
    const id = params.order_id;

    return Cache.exec(`designation:${id}`, () => {
      // We ensure that the order has been fully loaded at least once.
      return store.findRecord(model, id, { reload: true });
    }).then(() => {
      return this.loadIfAbsent(model, id);
    });
  }
});
