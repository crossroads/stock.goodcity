import Ember from "ember";
import _ from "lodash";

import ApiBaseService from "./api-base-service";
import { toID } from "stock/utils/helpers";

export default ApiBaseService.extend({
  store: Ember.inject.service(),

  async getOrganisationOrders(order, opts = {}) {
    const store = this.get("store");
    const pagination = _.pick(opts, ["page", "per_page"]);
    const id = toID(order);

    const data = await this.GET(`/gc_organisations/${id}/orders`, pagination);
    store.pushPayload(data);
    return store.peekRecord("gc_organisation", id).get("designations");
  },

  create(params) {
    return this.POST("/gc_organisations", { organisation: params });
  },

  update(params, id) {
    return this.PUT(`/gc_organisations/${id}`, { organisation: params });
  }
});
