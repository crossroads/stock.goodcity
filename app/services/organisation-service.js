import Ember from "ember";
import _ from "lodash";

import ApiBaseService from "./api-base-service";
import { toID } from "stock/utils/helpers";
import NavigationAwareness from "stock/mixins/navigation_aware";

export default ApiBaseService.extend(NavigationAwareness, {
  store: Ember.inject.service(),

  init() {
    this._super(...arguments);
    this.set("openOrganisationSearch", false);
  },

  onNavigation() {
    this.getWithDefault("onOrganisationSelected", _.noop)(null);
  },

  async getOrganisationOrders(order, opts = {}) {
    const store = this.get("store");
    const pagination = _.pick(opts, ["page", "per_page"]);
    const id = toID(order);

    const data = await this.GET(`/organisations/${id}/orders`, pagination);
    store.pushPayload(data);
    return store.peekRecord("organisation", id).get("designations");
  },

  /**
   * Triggers an organisation search overlay
   * @returns {Promise<Model>}
   */
  userPickOrganisation() {
    return new Promise((resolve, reject) => {
      Ember.run(() => {
        this.set("openOrganisationSearch", true);
        this.set("onOrganisationSelect", organisation => {
          this.set("onOrganisationSelect", _.noop);
          this.set("openOrganisationSearch", false);
          resolve(organisation || null);
        });
      });
    });
  },

  create(params) {
    return this.POST("/organisations", { organisation: params });
  },

  update(id, params) {
    return this.PUT(`/organisations/${id}`, { organisation: params });
  }
});
