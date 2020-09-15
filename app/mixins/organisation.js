import Ember from "ember";
import AsyncMixin from "./async";

export default Ember.Mixin.create(AsyncMixin, {
  organisationService: Ember.inject.service(),

  async organisationLookup() {
    const organisation = await this.get(
      "organisationService"
    ).userPickOrganisation();

    return organisation;
  },

  actions: {
    async withOrganisationNavigation(to, id, options = {}) {
      const organisation = await this.organisationLookup();

      if (!to) {
        return this.replaceRoute("organisations.detail", organisation.id);
      }

      if (Object.keys(options).length) {
        if (id) {
          return this.replaceRoute(to, id, options);
        }
        return this.replaceRoute(to, options);
      }
    }
  }
});
