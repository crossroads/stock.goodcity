import Ember from "ember";
import ApiBaseService from "./api-base-service";
import _ from "lodash";
import { toID } from "stock/utils/helpers";

export default ApiBaseService.extend({
  store: Ember.inject.service(),

  async getOrganisationOrders(order, opts = {}) {
    const store = this.get("store");
    const pagination = _.pick(opts, ["page", "per_page"]);
    const id = toID(order);

    const data = await this.GET(
      `/gc_organisations/${id}/organisation_orders`,
      pagination
    );
    store.pushPayload(data);
    return store.peekRecord("gc_organisation", id).get("designations");
  }
});
