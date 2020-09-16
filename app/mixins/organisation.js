import Ember from "ember";
import AsyncMixin from "./async";

export default Ember.Mixin.create(AsyncMixin, {
  organisationService: Ember.inject.service(),
  /**
   * Open's the organisation overlay.
   * Returns the selected organisation record
   * @returns {Object}
   */
  async organisationLookup() {
    const organisation = await this.get(
      "organisationService"
    ).userPickOrganisation();

    return organisation;
  },

  actions: {
    /**
     * Open's the organisation overlay.
     * Once the organisation is selected, navigates to the required url
     * If no options are provided, then it navigates to the organisation detail screen
     * @param {string} to
     * @param {number} id
     * @param {Object} options
     */
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
